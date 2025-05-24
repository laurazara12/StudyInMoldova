const { Program, University } = require('../models');
const { Op } = require('sequelize');
const OpenAI = require('openai');

// Inițializăm clientul OpenAI pentru DeepSeek
let openai;
try {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('AVERTISMENT: DEEPSEEK_API_KEY nu este configurat în fișierul .env');
  }
  openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || 'dummy-key'
  });
} catch (error) {
  console.error('Eroare la inițializarea clientului OpenAI:', error);
}

// Funcție pentru detectarea limbii
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
  
  return 'engleză'; // limba implicită
};

// Răspunsuri predefinite pentru diferite tipuri de întrebări
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
    
    // Verificăm dacă avem o întrebare validă
    if (!question || question.trim().length < 2) {
      return res.json({
        success: true,
        message: defaultResponses.greeting['română']
      });
    }

    // Detectăm limba întrebării
    const detectedLanguage = detectLanguage(question);

    // Verificăm dacă întrebarea este relevantă pentru site-ul nostru
    const relevantKeywords = [
      // Termeni generali despre studii
      'studii', 'universitate', 'moldova', 'program', 'curs', 'facultate',
      'taxă', 'bursă', 'admitere', 'cazare', 'studenți', 'educație',
      'mediu', 'academic', 'campus', 'profesor', 'cursant', 'student',
      
      // Detașamente și specializări
      'licență', 'master', 'doctorat', 'specializare', 'profil', 'domeniu',
      'inginerie', 'medicină', 'drept', 'economie', 'informatică', 'științe',
      
      // Aspecte administrative
      'înscriere', 'documente', 'diplomă', 'certificat', 'transcript',
      'viză', 'permis', 'rezidență', 'cazare', 'camin', 'dormitor',
      
      // Aspecte financiare
      'cost', 'preț', 'plățile', 'taxă', 'bursă', 'scholarship',
      'finanțare', 'ajutor', 'sprijin', 'reducere', 'discount',
      
      // Aspecte academice
      'examen', 'notă', 'evaluare', 'semestru', 'an', 'sesiune',
      'profesor', 'curs', 'seminar', 'laborator', 'practică',
      'mediu', 'academic', 'campus', 'facultate', 'departament',
      
      // Aspecte sociale și culturale
      'viață', 'social', 'activități', 'club', 'asociație', 'eveniment',
      'cultură', 'tradiții', 'limbă', 'română', 'rusă', 'engleză',
      
      // Servicii pentru studenți
      'bibliotecă', 'cantină', 'sport', 'sănătate', 'medical',
      'transport', 'autobuz', 'tramvai', 'taxi', 'internet', 'wifi',
      
      // Orașe și locații
      'chișinău', 'bălți', 'cahul', 'tiraspol', 'bender', 'orhei',
      'campus', 'clădire', 'facultate', 'departament', 'centru'
    ];

    // Obținem recomandările din baza de date
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
        throw new Error('Clientul OpenAI nu a fost inițializat corect');
      }

      // Pregătim contextul pentru DeepSeek
      const systemPrompt = `Ești un asistent prietenos și util specializat în ajutarea studenților să găsească programe de studii în Moldova. 
      Ai acces la următoarele programe: ${JSON.stringify(recommendations)}.
      
      Instrucțiuni pentru răspunsuri:
      1. Răspunde în aceeași limbă în care primești întrebarea (română, engleză sau rusă)
      2. Pentru saluturi simple, răspunde prietenos și întreabă cum te poate ajuta cu studiile în Moldova
      3. Pentru întrebări generale despre Moldova, răspunde pe scurt și redirecționează conversația către studii
      4. Pentru întrebări despre studii, oferă informații detaliate despre:
         - Calitatea educației în Moldova
         - Relația profesor-student
         - Facilitățile universitare
         - Oportunitățile de dezvoltare
         - Viața studențească
         - Integrarea studenților internaționali
      5. Dacă întrebarea nu este legată de studii, răspunde politicos și sugerează să discutăm despre studii în Moldova
      6. Menține un ton prietenos și profesionist în toate răspunsurile`;

      // Încercăm să obținem răspunsul de la DeepSeek
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
      // Folosim răspunsuri predefinite în caz de eroare
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
      message: 'Îmi pare rău, a apărut o eroare. Vă rugăm să încercați din nou.'
    });
  }
}; 