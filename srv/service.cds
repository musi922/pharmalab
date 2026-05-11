using com.moyo.demo.myfiorielementsproject as my from '../db/schema';

service MainService {
  @odata.draft.enabled: true
  entity Products as projection on my.Products actions {
    action discontinueProduct() returns String;
  };
  entity Categories as projection on my.Categories;
  entity Suppliers as projection on my.Suppliers;
  entity Orders as projection on my.Orders;
  entity Order_Details as projection on my.Order_Details;
  entity Customers as projection on my.Customers;
  entity Comments as projection on my.Comments;

  action shipOrder(orderID: UUID) returns String;
  function getLowStockProducts() returns array of Products;
}

using from './field-control';
using from './change-tracking';
using from '../app/project1/annotations';

