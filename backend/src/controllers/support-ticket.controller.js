const prisma = require("../config/prisma");
const { notifyAdmins } = require("../services/notification.service");

// CREATE TICKET
const createSupportTicket = async (req, res) => {
  const {
    customerId,
    subject,
    description,
    priority,
  } = req.body;

  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        customerId,
        subject,
        description,
        priority,
      },
      include: {
        customer: true,
        messages: true,
      },
    });

    // Notify admins
    try {
      await notifyAdmins({
        title: "New Support Ticket",
        message: `Support ticket #${ticket.id} was created. Subject: ${ticket.subject}`,
        type: "SUPPORT",
      });

      console.log(
        `Support ticket notification sent for ticket #${ticket.id}`
      );
    } catch (notificationError) {
      console.error(
        "Support ticket notification error:",
        notificationError
      );
    }

    return res.status(201).json({
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create support ticket error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL TICKETS
const getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        customer: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Support tickets retrieved successfully",
      tickets,
    });
  } catch (error) {
    console.error("Get support tickets error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET TICKET BY ID
const getSupportTicketById = async (req, res) => {
  const ticketId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        message: "Ticket ID must be a positive integer",
      });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        customer: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    return res.status(200).json({
      message: "Support ticket retrieved successfully",
      ticket,
    });
  } catch (error) {
    console.error("Get support ticket error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// UPDATE TICKET
const updateSupportTicket = async (req, res) => {
  const ticketId = parseInt(req.params.id);

  try {
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        message: "Ticket ID must be a positive integer",
      });
    }

    const existingTicket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!existingTicket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    const ticket = await prisma.supportTicket.update({
      where: {
        id: ticketId,
      },
      data: req.body,
      include: {
        customer: true,
        messages: true,
      },
    });

    return res.status(200).json({
      message: "Support ticket updated successfully",
      ticket,
    });
  } catch (error) {
    console.error("Update support ticket error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ADD MESSAGE
const addSupportMessage = async (req, res) => {
  const ticketId = parseInt(req.params.id);

  const { sender, message } = req.body;

  try {
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        message: "Ticket ID must be a positive integer",
      });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId,
        sender,
        message,
      },
    });

    return res.status(201).json({
      message: "Support message added successfully",
      supportMessage: newMessage,
    });
  } catch (error) {
    console.error("Add support message error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createSupportTicket,
  getAllSupportTickets,
  getSupportTicketById,
  updateSupportTicket,
  addSupportMessage,
};