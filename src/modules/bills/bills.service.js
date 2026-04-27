import * as billsRepo from "./bills.repository.js";
import * as authRepo from "../auth/auth.repository.js";
import { v7 as uuidv7 } from "uuid";

export const getUserBills = async (userId, filters) => {
  const existingUser = await authRepo.findUserById(userId);
  if (!existingUser) {
    const error = new Error("User does not exist!");
    error.status = 400;
    throw error;
  }

  const userBills = await billsRepo.findAllBillsByUserId(
    existingUser.id,
    filters,
  );
  const userBillsWithOutUserId = userBills.map((bill) => {
    const { user_id, ...restOfBill } = bill;
    return restOfBill;
  });
  return userBillsWithOutUserId;
};

export const createUserBill = async (data, currentUser) => {
  const existingUser = await authRepo.findUserById(currentUser.id);
  if (!existingUser) {
    const error = new Error("User does not exist!");
    error.status = 400;
    throw error;
  }

  const { title, amount, due_date, status } = data;
  const bill = {
    id: uuidv7(),
    user_id: existingUser.id,
    title,
    amount,
    due_date,
    status,
  };

  const result = await billsRepo.insertBillToDB(bill);
  const { user_id, ...restOfBill } = result;
  if (!result) {
    const error = new Error("Error creating bill. Please try again.");
    error.status = 400;
    throw error;
  }

  return restOfBill;
};

export const updateUserBill = async (billId, data, currentUser) => {
  const existingUser = await authRepo.findUserById(currentUser.id);
  if (!existingUser) {
    const error = new Error("User does not exist!");
    error.status = 400;
    throw error;
  }

  const existingBill = await billsRepo.findBillById(billId);
  if (!existingBill) {
    const error = new Error("Bill does not exist!");
    error.status = 400;
    throw error;
  }

  if (existingBill.user_id !== existingUser.id) {
    const error = new Error("You are not authorized to update this bill!");
    error.status = 403;
    throw error;
  }

  const { title, amount, due_date, status } = data;
  const bill = {
    id: existingBill.id,
    user_id: existingUser.id,
    title,
    amount,
    due_date,
    status,
  };

  const result = await billsRepo.updateBillInDB(bill);
  const { user_id, ...restOfBill } = result;
  if (!result) {
    const error = new Error("Error updating bill. Please try again.");
    error.status = 400;
    throw error;
  }
  return restOfBill;
};

export const deleteUserBill = async (billId, currentUser) => {
  const existingUser = await authRepo.findUserById(currentUser.id);
  if (!existingUser) {
    const error = new Error("User does not exist!");
    error.status = 400;
    throw error;
  }

  const existingBill = await billsRepo.findBillById(billId);
  if (!existingBill) {
    const error = new Error("Bill does not exist!");
    error.status = 400;
    throw error;
  }

  if (existingBill.user_id !== existingUser.id) {
    const error = new Error("You are not authorized to delete this bill!");
    error.status = 403;
    throw error;
  }

  const result = await billsRepo.deleteBillInDB(billId);
  if (!result) {
    const error = new Error("Error deleting bill. Please try again.");
    error.status = 400;
    throw error;
  }
  return { message: "Bill deleted successfully" };
};
