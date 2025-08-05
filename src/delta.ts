
export type SetProperty = {
  path: PropertyKey[];
  type: 'set-property';
  key: PropertyKey;
  value: any;
};

export type CreateProperty = {
  path: PropertyKey[];
  type: 'create-property';
  key: PropertyKey;
  value: any;
};

export type DeleteProperty = {
  path: PropertyKey[];
  type: 'delete-property';
  key: PropertyKey;
};

/**
 * The interface that holds all delta types.
 *
 * You can extend this interface to define your own deltas.
 */
export interface DeltaTypes {
  'set-property': SetProperty;
  'create-property': CreateProperty;
  'delete-property': DeleteProperty;
}

export type Delta = DeltaTypes[keyof DeltaTypes];

