using MainService as service from '../../srv/service';
using from '../../srv/service';
using from '../../db/schema';

annotate service.Products with @(
    UI.HeaderInfo : {
        TypeName : 'Product',
        TypeNamePlural : 'Products',
        Title : { Value : name },
        Description : { Value : category.name }
    },
    UI.SelectionFields : [
        name,
        supplier.companyName,
        category.name,
        supplier.country,
        unitPrice
    ],
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
        }
    ],
    UI.HeaderFacets : [
        {
            $Type : 'UI.ReferenceFacet',
            Target : '@UI.DataPoint#UnitsInStock',
            Label : 'Stock Level'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Target : '@UI.DataPoint#UnitPrice',
            Label : 'Current Price'
        }
    ],
    UI.DataPoint #UnitsInStock : {
        Value : unitsInStock,
        Title : 'Units in Stock',
        Criticality : unitsInStock,
        CriticalityRepresentation : #Progress
    },
    UI.DataPoint #UnitPrice : {
        Value : unitPrice,
        Title : 'Price',
        Criticality : #Neutral
    },
    UI.Facets : [
        {
            $Type : 'UI.CollectionFacet',
            Label : 'General Information',
            ID : 'GeneralInformation',
            Facets : [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'Product Details',
                    Target : '@UI.FieldGroup#ProductDetails'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'Quantity Info',
                    Target : '@UI.FieldGroup#QuantityInfo'
                }
            ]
        },
        {
            $Type : 'UI.CollectionFacet',
            Label : 'Inventory & Pricing',
            ID : 'InventoryPricing',
            Facets : [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'Stock Details',
                    Target : '@UI.FieldGroup#StockDetails'
                }
            ]
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Supplier Information',
            Target : '@UI.FieldGroup#SupplierInfo'
        }
    ],
    UI.FieldGroup #ProductDetails : {
        Data : [
            { Value : name },
            { Value : category_ID, Label : 'Category ID' },
            { Value : discontinued }
        ]
    },
    UI.FieldGroup #QuantityInfo : {
        Data : [
            { Value : quantityPerUnit },
            { Value : reorderLevel }
        ]
    },
    UI.FieldGroup #StockDetails : {
        Data : [
            { Value : unitsInStock },
            { Value : unitsOnOrder },
            { Value : unitPrice }
        ]
    },
    UI.FieldGroup #SupplierInfo : {
        Data : [
            { Value : supplier.companyName, Label : 'Supplier' },
            { Value : supplier.contactName },
            { Value : supplier.address },
            { Value : supplier.city },
            { Value : supplier.country }
        ]
    },
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'MainService.discontinueProduct',
            Label : 'Discontinue Product',
            ID : 'DiscontinueAction'
        }
    ]
);


