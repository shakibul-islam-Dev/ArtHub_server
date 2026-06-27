const Payment = require("../models/Payment");

// ======================== GET ALL PAYMENTS ========================
const getAll = async () => {
  const payments = await Payment.find();
  return payments;
};

// ======================== GET SINGLE PAYMENT BY ID ========================
const getById = async (id) => {
  const payment = await Payment.findById(id);
  if (!payment) {
    return { message: "Payment not found" };
  }
  return payment;
};

// ======================== CREATE NEW PAYMENT ========================
const create = async (payment) => {
  const newPayment = new Payment(payment);
  const savedPayment = await newPayment.save();
  return savedPayment;
};

// ======================== UPDATE PAYMENT ========================
const update = async (id, payment) => {
  const existingPayment = await Payment.findById(id);
  if (!existingPayment) {
    return { message: "Payment not found" };
  }

  const updateData = {
    amount: payment.amount,
    user_id: payment.user_id,
    artwork_id: payment.artwork_id,
    date_uploaded: payment.date_uploaded,
  };

  const updatedPayment = await Payment.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  return updatedPayment;
};

// ======================== DELETE PAYMENT ========================
const deletePayment = async (id) => {
  const payment = await Payment.findByIdAndDelete(id);
  if (!payment) {
    return { message: "Payment not found" };
  }
  return { message: "Payment deleted successfully" };
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deletePayment,
};
