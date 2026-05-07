const cds = require("@sap/cds");

module.exports = class MainService extends cds.ApplicationService {
  async init() {
    this.before("CREATE", "Products", this._validateProduct.bind(this));
    this.before("UPDATE", "Products", this._validateProduct.bind(this));

    this.before("CREATE", "Orders", this._validateOrder.bind(this));
    this.before("UPDATE", "Orders", this._validateOrder.bind(this));

    this.before(
      "CREATE",
      "Order_Details",
      this._validateOrderDetail.bind(this),
    );
    this.after(
      "CREATE",
      "Order_Details",
      this._onOrderDetailCreated.bind(this),
    );
    this.after(
      "DELETE",
      "Order_Details",
      this._onOrderDetailDeleted.bind(this),
    );

    this.on("shipOrder", this._onShipOrder.bind(this));
    this.on("discontinueProduct", this._onDiscontinueProduct.bind(this));
    this.on("getLowStockProducts", this._onGetLowStockProducts.bind(this));

    this.on("error", (err, req) => {
      if (err.code === "SQLITE_CONSTRAINT_NOTNULL" || err.message.includes("NOT NULL")) {
        const sMsgKey = "MANDATORY_FIELD_MISSING";
        const sFieldKey = "productName";

        if (req && typeof req.t === 'function') {
          err.message = req.t(sMsgKey, [req.t(sFieldKey)]);
        } else {
          err.message = `Please fill in the mandatory field 'Product name'.`;
        }
        err.status = 400;
      }
    });

    return super.init();
  }

  async _validateProduct(req) {
    const { unitPrice, unitsInStock } = req.data;

    if (unitPrice !== undefined && unitPrice <= 0) {
      req.error(400, req.t("UNIT_PRICE_ERROR"), "unitPrice");
    }
    if (unitsInStock !== undefined && unitsInStock < 0) {
      req.error(400, req.t("UNITS_IN_STOCK_ERROR"), "unitsInStock");
    }
  }

  async _validateOrder(req) {
    const { orderDate, requiredDate } = req.data;

    // Client-side UI5 handles mandatory checks for customer and date
    if (
      orderDate &&
      requiredDate &&
      new Date(requiredDate) <= new Date(orderDate)
    ) {
      req.error(400, req.t("REQUIRED_DATE_ERROR"), "requiredDate");
    }
  }

  async _validateOrderDetail(req) {
    const { quantity, discount, product_ID, unitPrice } = req.data;

    if (quantity !== undefined && quantity <= 0) {
      req.error(400, req.t("QUANTITY_ERROR"), "quantity");
    }
    if (discount !== undefined && (discount < 0 || discount > 1)) {
      req.error(400, req.t("DISCOUNT_ERROR"), "discount");
    }
    if (unitPrice !== undefined && unitPrice <= 0) {
      req.error(400, req.t("UNIT_PRICE_ERROR"), "unitPrice");
    }

    if (product_ID) {
      const product = await SELECT.one
        .from("com.moyo.demo.myfiorielementsproject.Products")
        .where({ ID: product_ID });

      if (!product) {
        req.error(404, req.t("PRODUCT_NOT_FOUND", [product_ID]), "product_ID");
        return;
      }
      if (product.discontinued) {
        req.error(
          400,
          req.t("PRODUCT_DISCONTINUED", [product.name]),
          "product_ID",
        );
        return;
      }
      if (quantity > product.unitsInStock) {
        req.error(
          400,
          req.t("INSUFFICIENT_STOCK", [
            product.name,
            product.unitsInStock,
            quantity,
          ]),
          "quantity",
        );
      }
    }
  }

  async _onOrderDetailCreated(data, req) {
    const { product_ID, quantity } = data;
    if (!product_ID || !quantity) return;

    const product = await SELECT.one
      .from("com.moyo.demo.myfiorielementsproject.Products")
      .where({ ID: product_ID });

    if (!product) return;

    await UPDATE("com.moyo.demo.myfiorielementsproject.Products")
      .set({
        unitsInStock: product.unitsInStock - quantity,
        unitsOnOrder: product.unitsOnOrder + quantity,
      })
      .where({ ID: product_ID });

    if (product.unitsInStock - quantity <= product.reorderLevel) {
      req.warn(
        202,
        `Product "${product.name}" has reached its reorder level. Current stock: ${product.unitsInStock - quantity}`,
      );
    }
  }

  async _onOrderDetailDeleted(data, req) {
    const { product_ID, quantity } = data;
    if (!product_ID || !quantity) return;

    const product = await SELECT.one
      .from("com.moyo.demo.myfiorielementsproject.Products")
      .where({ ID: product_ID });

    if (!product) return;

    await UPDATE("com.moyo.demo.myfiorielementsproject.Products")
      .set({
        unitsInStock: product.unitsInStock + quantity,
        unitsOnOrder: Math.max(0, product.unitsOnOrder - quantity),
      })
      .where({ ID: product_ID });
  }

  async _onShipOrder(req) {
    const { orderID } = req.data;

    const order = await SELECT.one
      .from("com.moyo.demo.myfiorielementsproject.Orders")
      .where({ ID: orderID });

    if (!order)
      return req.error(404, req.t("PRODUCT_NOT_FOUND", [orderID]));
    if (order.shippedDate)
      return req.error(400, req.t("ORDER_SHIPPED_ALREADY", [orderID]));

    const orderDetails = await SELECT.from(
      "com.moyo.demo.myfiorielementsproject.Order_Details",
    ).where({ order_ID: orderID });

    if (!orderDetails.length)
      return req.error(400, req.t("ORDER_NO_ITEMS", [orderID]));

    await UPDATE("com.moyo.demo.myfiorielementsproject.Orders")
      .set({ shippedDate: new Date().toISOString().split("T")[0] })
      .where({ ID: orderID });

    for (const detail of orderDetails) {
      const product = await SELECT.one
        .from("com.moyo.demo.myfiorielementsproject.Products")
        .where({ ID: detail.product_ID });

      if (product) {
        await UPDATE("com.moyo.demo.myfiorielementsproject.Products")
          .set({
            unitsOnOrder: Math.max(0, product.unitsOnOrder - detail.quantity),
          })
          .where({ ID: detail.product_ID });
      }
    }

    return `Order ${orderID} has been successfully shipped`;
  }

  async _onDiscontinueProduct(req) {
    const productID = req.params[0].ID || req.params[0];

    const product = await SELECT.one
      .from("com.moyo.demo.myfiorielementsproject.Products")
      .where({ ID: productID });

    if (!product)
      return req.error(404, req.t("PRODUCT_NOT_FOUND", [productID]));
    if (product.discontinued)
      return req.error(
        400,
        req.t("PRODUCT_DISCONTINUED", [product.name]),
      );

    const openOrders = await SELECT.from(
      "com.moyo.demo.myfiorielementsproject.Order_Details",
    ).where({ product_ID: productID });

    if (openOrders.length) {
      const unshippedOrders = await SELECT.from(
        "com.moyo.demo.myfiorielementsproject.Orders",
      ).where({
        ID: { in: openOrders.map((o) => o.order_ID) },
        shippedDate: null,
      });

      if (unshippedOrders.length) {
        return req.error(
          400,
          req.t("CANNOT_DISCONTINUE", [product.name, unshippedOrders.length]),
        );
      }
    }

    await UPDATE("com.moyo.demo.myfiorielementsproject.Products")
      .set({ discontinued: true })
      .where({ ID: productID });

    return `Product "${product.name}" has been discontinued`;
  }

  async _onGetLowStockProducts(req) {
    return SELECT.from("com.moyo.demo.myfiorielementsproject.Products")
      .where("unitsInStock <= reorderLevel")
      .and({ discontinued: false });
  }
};
