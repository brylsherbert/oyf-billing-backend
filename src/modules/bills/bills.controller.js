import * as billsService from "./bills.service.js";
import { handleResponse } from "../../utils/response-handler.js";

export const getUserBills = async (req, res, next) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    minAmount: req.query.minAmount,
    maxAmount: req.query.maxAmount,
    isPaid: req.query.isPaid,
    search: req.query.search,
  };

  try {
    const result = await billsService.getUserBills(req.user.id, filters);
    handleResponse(res, 200, "User bills retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const createUserBill = async (req, res, next) => {
  try {
    const newBill = await billsService.createUserBill(req.body, req.user);
    handleResponse(res, 201, "Bill created successfully", newBill);
  } catch (error) {
    next(error);
  }
};

export const updateUserBill = async (req, res, next) => {
  try {
    const updatedBill = await billsService.updateUserBill(req.params.id, req.body, req.user);
    handleResponse(res, 200, "Bill updated successfully", updatedBill);
  } catch (error) {
    next(error);
  }
};

export const deleteUserBill = async (req, res, next) => {
  try {
    await billsService.deleteUserBill(req.params.id, req.user);
    handleResponse(res, 200, "Bill deleted successfully");
  } catch (error) {
    next(error);
  }
};
