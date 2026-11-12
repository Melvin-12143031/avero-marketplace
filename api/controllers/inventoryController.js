import {
  adjustStock,
  getInventoryMovements,
} from "../services/inventoryService.js";

const adjustStockController = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, movementType, reason } = req.body;
    const userId = req.user.id;

    const result = await adjustStock(
      productId,
      quantity,
      movementType,
      reason,
      userId,
    );

    res.status(200).json({
      status: "success",
      message: "Product stock adjusted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryMovementsController = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const { page, limit } = req.validatedQuery;

    const result = await getInventoryMovements(productId, page, limit);

    res.status(200).json({
      status: "success",
      results: result.movements.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { adjustStockController, getInventoryMovementsController };
