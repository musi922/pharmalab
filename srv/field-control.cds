using { MainService } from './service';

annotate MainService.Products {
    discontinued @Common.FieldControl: #ReadOnly;
} actions {
    discontinueProduct @(
        Core.OperationAvailable : { $edmJson: { $Eq: [{ $Path: 'discontinued' }, false] } },
        Common.IsActionCritical : true,
        Common.ConfirmationMsg : 'Do you want to discontinue?',
        Common.DialogTitle : 'Discontinue Product',
        Common.SideEffects : {
            $Type : 'Common.SideEffectsType',
            TargetProperties : [
                'discontinued'
            ],
            TargetEntities : [
                '/MainService.EntityContainer/Products'
            ]
        }
    );
};
