const { Program, University } = require('../models');
const { Op } = require('sequelize');
const OpenAI = require('openai');

// Initialize OpenAI client for DeepSeek
let openai;
try {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('WARNING: DEEPSEEK_API_KEY is not configured in .env file');
  }
  openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || 'dummy-key'
  });
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

// Function for language detection
const detectLanguage = (text) => {
  const romanianWords = ['bună', 'salut', 'ce', 'cum', 'sunt', 'suntem', 'vă', 'te', 'mă', 'îmi', 'și', 'sau', 'dar', 'pentru', 'despre'];
  const englishWords = ['hello', 'hi', 'what', 'how', 'are', 'is', 'you', 'me', 'my', 'and', 'or', 'but', 'for', 'about'];
  const russianWords = ['привет', 'здравствуйте', 'как', 'что', 'где', 'когда', 'почему', 'кто', 'и', 'или', 'но', 'для', 'о'];

  const words = text.toLowerCase().split(/\s+/);
  
  let romanianCount = 0;
  let englishCount = 0;
  let russianCount = 0;

  words.forEach(word => {
    if (romanianWords.includes(word)) romanianCount++;
    if (englishWords.includes(word)) englishCount++;
    if (russianWords.includes(word)) russianCount++;
  });

  if (romanianCount > englishCount && romanianCount > russianCount) return 'română';
  if (englishCount > romanianCount && englishCount > russianCount) return 'engleză';
  if (russianCount > romanianCount && russianCount > englishCount) return 'rusă';
  
  return 'engleză'; // default language
};

// Predefined responses for different types of questions
const defaultResponses = {
  greeting: {
    'română': 'Bună! Sunt asistentul tău pentru alegerea programului de studii în Moldova. Cu ce te pot ajuta astăzi?',
    'engleză': 'Hello! I am your assistant for choosing a study program in Moldova. How can I help you today?',
    'rusă': 'Здравствуйте! Я ваш помощник по выбору учебной программы в Молдове. Как я могу вам помочь сегодня?'
  },
  general: {
    'română': 'Îmi poți întreba despre programe de studii, universități, taxe de școlarizare, procesul de admitere sau alte aspecte legate de educație în Moldova.',
    'engleză': 'You can ask me about study programs, universities, tuition fees, admission process, or other aspects related to education in Moldova.',
    'rusă': 'Вы можете спросить меня о программах обучения, университетах, стоимости обучения, процессе поступления или других аспектах, связанных с образованием в Молдове.'
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { interests, budget, duration, language, question } = req.body;
    
    // Check if we have a valid question
    if (!question || question.trim().length < 2) {
      return res.json({
        success: true,
        message: defaultResponses.greeting['engleză']
      });
    }

    // Detect the question language
    const detectedLanguage = detectLanguage(question);

    // Check if the question is relevant to our website
    const relevantKeywords = [
      // General study terms
      'studii', 'universitate', 'moldova', 'program', 'curs', 'facultate',
      'taxă', 'bursă', 'admitere', 'cazare', 'studenți', 'educație',
      'mediu', 'academic', 'campus', 'profesor', 'cursant', 'student',
      
      // Degrees and specializations
      'licență', 'master', 'doctorat', 'specializare', 'profil', 'domeniu',
      'inginerie', 'medicină', 'drept', 'economie', 'informatică', 'științe',
      
      // Administrative aspects
      'înscriere', 'documente', 'diplomă', 'certificat', 'transcript',
      'viză', 'permis', 'rezidență', 'cazare', 'camin', 'dormitor',
      
      // Financial aspects
      'cost', 'preț', 'plățile', 'taxă', 'bursă', 'scholarship',
      'finanțare', 'ajutor', 'sprijin', 'reducere', 'discount',
      
      // Academic aspects
      'examen', 'notă', 'evaluare', 'semestru', 'an', 'sesiune',
      'profesor', 'curs', 'seminar', 'laborator', 'practică',
      'mediu', 'academic', 'campus', 'facultate', 'departament',
      
      // Social and cultural aspects
      'viață', 'social', 'activități', 'club', 'asociație', 'eveniment',
      'cultură', 'tradiții', 'limbă', 'română', 'rusă', 'engleză',
      
      // Student services
      'bibliotecă', 'cantină', 'sport', 'sănătate', 'medical',
      'transport', 'autobuz', 'tramvai', 'taxi', 'internet', 'wifi',
      
      // Cities and locations
      'chișinău', 'bălți', 'cahul', 'tiraspol', 'bender', 'orhei',
      'campus', 'clădire', 'facultate', 'departament', 'centru'
    ];

    // Get recommendations from database
    const recommendations = await Program.findAll({
      include: [{
        model: University,
        as: 'University',
        attributes: ['name', 'location']
      }],
      where: {
        language: language,
        duration: duration,
        tuition_fees: {
          [Op.lte]: budget
        }
      }
    });

    let aiResponse;
    try {
      if (!openai) {
        throw new Error('OpenAI client was not properly initialized');
      }

      // Prepare context for DeepSeek
      const systemPrompt = `You are a friendly and helpful assistant specialized in helping students find study programs in Moldova.
      You have access to the following programs: ${JSON.stringify(recommendations)}.
      
      Response instructions:
      1. Respond in the same language as the question (Romanian, English, or Russian)
      2. For simple greetings, respond friendly and ask how you can help with studies in Moldova
      3. For general questions about Moldova, respond briefly and redirect the conversation to studies
      4. For questions about studies, provide detailed information about:
         - Quality of education in Moldova
         - Professor-student relationship
         - University facilities
         - Development opportunities
         - Student life
         - Integration of international students
      5. If the question is not related to studies, respond politely and suggest discussing studies in Moldova
      6. Maintain a friendly and professional tone in all responses`;

      // Try to get response from DeepSeek
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        model: "deepseek-chat",
        temperature: 0.7,
        max_tokens: 1000
      });
      aiResponse = completion.choices[0].message.content;
    } catch (apiError) {
      console.error('DeepSeek API Error:', apiError);
      // Use predefined responses in case of error
      if (question.toLowerCase().includes('bună') || question.toLowerCase().includes('salut')) {
        aiResponse = defaultResponses.greeting[detectedLanguage];
      } else {
        aiResponse = defaultResponses.general[detectedLanguage];
      }
    }

    if (recommendations.length === 0) {
      return res.json({
        success: true,
        message: aiResponse || defaultResponses.general[detectedLanguage]
      });
    }

    res.json({
      success: true,
      data: recommendations,
      message: aiResponse || defaultResponses.general[detectedLanguage]
    });
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, an error occurred. Please try again.'
    });
  }
}; 