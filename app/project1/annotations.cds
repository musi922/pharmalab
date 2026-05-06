using MainService as service from '../../srv/service';
using from '../../srv/service';
using from '../../db/schema';

annotate service.Products with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : name,
            Label : '{i18n>productName}',
        },
        {
            $Type : 'UI.DataField',
            Value : supplier.companyName,
            Label : '{i18n>companyName}',
        },
        {
            $Type : 'UI.DataField',
            Value : category.name,
            Label : '{i18n>categoryName}',
        },
        {
            $Type : 'UI.DataField',
            Value : unitPrice,
            Label : '{i18n>unitPrice}',
        },
        {
            $Type : 'UI.DataField',
            Value : unitsInStock,
            Label : '{i18n>unitInStock}',
        },
        {
            $Type : 'UI.DataField',
            Value : discontinued,
            Label : 'Discontinued',
        },
        {
            $Type : 'UI.DataField',
            Value : supplier.country,
            Label : 'Country',
        },
        {
            $Type : 'UI.DataField',
            Value : supplier.phone,
            Label : 'Phone',
        },
    ]
);

