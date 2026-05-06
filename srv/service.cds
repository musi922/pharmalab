using com.moyo.demo.myfiorielementsproject as my from '../db/schema';

service MainService {
  entity Products as projection on my.Products;
  entity Categories as projection on my.Categories;
  entity Suppliers as projection on my.Suppliers;
  entity Orders as projection on my.Orders;
  entity Order_Details as projection on my.Order_Details;
  entity Customers as projection on my.Customers;

  action shipOrder(orderID: UUID) returns String;
  action discontinueProduct(productID: UUID) returns String;
  function getLowStockProducts() returns array of Products;
}
