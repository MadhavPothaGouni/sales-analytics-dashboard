const Sales = require("../models/Sales");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// GET aggregated sales analytics
exports.getSales = async (req, res) => {
  try {
    // Optional date filter
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate && endDate) {
      match.reportDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Aggregate sales
    const totalRevenueResult = await Sales.aggregate([
      { $match: match },
      { $group: { _id: null, totalRevenue: { $sum: "$totalRevenue" }, totalOrders: { $sum: 1 } } },
    ]);

    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
    const totalOrders = totalRevenueResult[0]?.totalOrders || 0;
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    // Top 5 products by revenue
    const topProducts = await Sales.aggregate([
      { $match: match },
      { $group: { _id: "$product", revenue: { $sum: "$totalRevenue" } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: "$productDetails.name",
          revenue: 1,
        },
      },
    ]);

    // Top 5 customers by revenue
    const topCustomers = await Sales.aggregate([
      { $match: match },
      { $group: { _id: "$customer", revenue: { $sum: "$totalRevenue" } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      { $unwind: "$customerDetails" },
      {
        $project: {
          _id: 0,
          customerId: "$_id",
          name: "$customerDetails.name",
          revenue: 1,
        },
      },
    ]);

    // Region-wise sales
    const regionSales = await Sales.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      { $unwind: "$customerDetails" },
      { $group: { _id: "$customerDetails.region", revenue: { $sum: "$totalRevenue" } } },
      { $project: { _id: 0, region: "$_id", revenue: 1 } },
    ]);

    res.json({
      totalRevenue,
      avgOrderValue,
      topProducts,
      topCustomers,
      regionSales,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
