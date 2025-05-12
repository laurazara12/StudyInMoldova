const { ContactMessage } = require('../models');

exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Mesajul de contact a fost creat cu succes',
      data: contactMessage
    });
  } catch (error) {
    console.error('Eroare la crearea mesajului de contact:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la crearea mesajului de contact',
      error: error.message,
      data: null
    });
  }
};

exports.getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      message: 'Mesajele de contact au fost preluate cu succes',
      data: messages,
      total: messages.length
    });
  } catch (error) {
    console.error('Eroare la obținerea mesajelor de contact:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea mesajelor de contact',
      error: error.message,
      data: [],
      total: 0
    });
  }
};

exports.getContactMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Mesajul nu a fost găsit',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Mesajul a fost preluat cu succes',
      data: message
    });
  } catch (error) {
    console.error('Eroare la obținerea mesajului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea mesajului',
      error: error.message,
      data: null
    });
  }
};

exports.updateContactMessage = async (req, res) => {
  try {
    const { status, response } = req.body;
    const message = await ContactMessage.findByPk(req.params.id);
    
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Mesajul nu a fost găsit',
        data: null
      });
    }
    
    message.status = status || message.status;
    message.response = response || message.response;
    
    await message.save();
    
    res.json({
      success: true,
      message: 'Mesajul a fost actualizat cu succes',
      data: message
    });
  } catch (error) {
    console.error('Eroare la actualizarea mesajului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la actualizarea mesajului',
      error: error.message,
      data: null
    });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Mesajul nu a fost găsit' });
    }
    
    await message.destroy();
    res.json({ message: 'Mesaj șters cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea mesajului:', error);
    res.status(500).json({ message: 'Eroare la ștergerea mesajului' });
  }
}; 