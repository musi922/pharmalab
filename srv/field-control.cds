using { MainService } from './service';

annotate MainService.Products {
    discontinued @Common.FieldControl: #ReadOnly;
} actions {
    discontinueProduct @(
        Core.OperationAvailable : { $edmJson: { $Eq: [{ $Path: 'discontinued' }, false] } },
        Common.SideEffects : {
            $Type : 'Common.SideEffectsType',
            TargetProperties : [
                'discontinued'
            ],
            TargetEntities : [
                '@$self'
            ]
        }
    );
};
