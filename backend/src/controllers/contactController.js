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
    
    res.status(201).json(contactMessage);
  } catch (error) {
    console.error('Eroare la crearea mesajului de contact:', error);
    res.status(500).json({ message: 'Eroare la crearea mesajului de contact' });
  }
};

exports.getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
  } catch (error) {
    console.error('Eroare la obținerea mesajelor de contact:', error);
    res.status(500).json({ message: 'Eroare la obținerea mesajelor de contact' });
  }
};

exports.getContactMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Mesajul nu a fost găsit' });
    }
    
    res.json(message);
  } catch (error) {
    console.error('Eroare la obținerea mesajului:', error);
    res.status(500).json({ message: 'Eroare la obținerea mesajului' });
  }
};

exports.updateContactMessage = async (req, res) => {
  try {
    const { status, response } = req.body;
    const message = await ContactMessage.findByPk(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Mesajul nu a fost găsit' });
    }
    
    message.status = status || message.status;
    message.response = response || message.response;
    
    await message.save();
    
    res.json(message);
  } catch (error) {
    console.error('Eroare la actualizarea mesajului:', error);
    res.status(500).json({ message: 'Eroare la actualizarea mesajului' });
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