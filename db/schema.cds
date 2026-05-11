namespace com.moyo.demo.myfiorielementsproject;
using { cuid, managed } from '@sap/cds/common';

entity Categories : cuid {
  name        : String(80)  not null;
  description : String(500);
  picture     : LargeBinary;
  products    : Association to many Products on products.category = $self;
}

entity Suppliers : cuid {
  companyName  : String(100) not null;
  contactName  : String(80);
  contactTitle : String(80);
  address      : String(200);
  city         : String(60);
  region       : String(60);
  postalCode   : String(20);
  country      : String(60);
  phone        : String(30);
  fax          : String(30);
  homePage     : String(200);
  products     : Association to many Products on products.supplier = $self;
}

@changelog: [name]
entity Products : cuid {
  @changelog
  name            : String(100) not null;
  @changelog: [supplier.companyName]
  supplier        : Association to one Suppliers;
  @changelog: [category.name]
  category        : Association to one Categories;
  @changelog
  quantityPerUnit : String(40);
  @changelog
  unitPrice       : Decimal(10, 2) default 0;
  @changelog
  unitsInStock    : Integer        default 0;
  @changelog
  unitsOnOrder    : Integer        default 0;
  @changelog
  reorderLevel    : Integer        default 0;
  @changelog
  discontinued    : Boolean        default false;
  comments        : Association to many Comments on comments.product = $self;
}

entity Comments : cuid, managed {
  product : Association to one Products;
  @changelog
  comment : String(1000);
}

entity Customers : cuid {
  companyName  : String(100) not null;
  contactName  : String(80);
  contactTitle : String(80);
  address      : String(200);
  city         : String(60);
  region       : String(60);
  postalCode   : String(20);
  country      : String(60);
  phone        : String(30);
  fax          : String(30);
}

entity Orders : cuid {
  customer       : Association to one Customers;
  orderDate      : Date;
  requiredDate   : Date;
  shippedDate    : Date;
  shipVia        : Integer;
  freight        : Decimal(10, 2) default 0;
  shipName       : String(100);
  shipAddress    : String(200);
  shipCity       : String(60);
  shipRegion     : String(60);
  shipPostalCode : String(20);
  shipCountry    : String(60);
  items          : Composition of many Order_Details on items.order = $self;
}

@changelog: [product.name]
entity Order_Details : cuid {
  order     : Association to one Orders   not null;
  product   : Association to one Products not null;
  @changelog
  unitPrice : Decimal(10, 2) not null;
  @changelog
  quantity  : Integer        not null default 1;
  @changelog
  discount  : Decimal(4, 2)           default 0;
}
