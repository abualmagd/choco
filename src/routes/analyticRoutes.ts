import { FastifyInstance, FastifyPluginAsync } from "fastify";

export const AnalyticRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  fastify.get("/analytics/summary", async (request, reply) => {
    try {
      // Get total users
      const totalUsers = await fastify.prisma.user.count({
        where: { role: "CUSTOMER" },
      });

      // Get total categories
      const totalCategories = await fastify.prisma.category.count({
        where: { isActive: true },
      });

      // Get total products
      const totalProducts = await fastify.prisma.product.count({
        where: { isActive: true, deletedAt: null },
      });

      // Get total orders
      const totalOrders = await fastify.prisma.order.count();

      // Get monthly sales
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      const monthlySales = await fastify.prisma.order.aggregate({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lte: currentDate,
          },
          paymentStatus: "PAID",
        },
        _sum: {
          total: true,
        },
      });

      // Get order status breakdown
      const orderStatusBreakdown = await fastify.prisma.order.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      });

      // Format order status data
      const statusCounts = {
        PENDING: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
        RETURNED: 0,
        REFUNDED: 0,
      };

      orderStatusBreakdown.forEach((item) => {
        statusCounts[item.status] = item._count.id;
      });

      // Get best selling products
      const bestSellingProducts = await fastify.prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: {
          quantity: true,
          total: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      });

      // Get product details for best sellers
      const productIds = bestSellingProducts.map((item) => item.productId);
      const products = await fastify.prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        select: {
          id: true,
          name: true,
          price: true,
        },
      });

      // Combine product details with sales data
      const bestProducts = bestSellingProducts.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          id: product?.id,
          name: product?.name,
          price: product?.price,
          quantity: item._sum.quantity,
          revenue: item._sum.total,
        };
      });

      return {
        success: true,
        data: {
          totalUsers,
          totalCategories,
          totalProducts,
          totalOrders,
          monthlySales: monthlySales._sum.total || 0,
          orderStatus: statusCounts,
          bestSellingProducts: bestProducts,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: "Failed to fetch analytics summary",
      });
    }
  });
};
