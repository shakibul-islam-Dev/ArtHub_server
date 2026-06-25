const Payment = require("../models/Payment");

class PaymentController {
  async getAll() {
    const payments = await Payment.find();
    return payments;
  }

  async getById(id) {
    const payment = await Payment.findById(id);
    if (!payment) {
      return { message: "Payment not found" };
    }
    return payment;
  }

  async create(payment) {
    const newPayment = new Payment(payment);
    const savedPayment = await newPayment.save();
    return savedPayment;
  }

  async update(id, payment) {
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
      new: true, // এর ফলে আপডেট হওয়া নতুন ডাটা রিটার্ন করবে
    });

    return updatedPayment;
  }

  async delete(id) {
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      return { message: "Payment not found" };
    }
    return { message: "Payment deleted successfully" };
  }
}

module.exports = new PaymentController();
