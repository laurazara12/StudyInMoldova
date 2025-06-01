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
      message: 'Contact message created successfully',
      data: contactMessage
    });
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating contact message',
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
      message: 'Contact messages retrieved successfully',
      data: messages,
      total: messages.length
    });
  } catch (error) {
    console.error('Error retrieving contact messages:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving contact messages',
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
        message: 'Message not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Message retrieved successfully',
      data: message
    });
  } catch (error) {
    console.error('Error retrieving message:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving message',
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
        message: 'Message not found',
        data: null
      });
    }
    
    message.status = status || message.status;
    message.response = response || message.response;
    
    await message.save();
    
    res.json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating message',
      error: error.message,
      data: null
    });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message' });
  }
}; 