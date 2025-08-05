
export type SetProperty = {
  path: PropertyKey[];
  type: 'set';
  key: PropertyKey;
  value: any;
};

export type CreateProperty = {
  path: PropertyKey[];
  type: 'create';
  key: PropertyKey;
  value: any;
};

export type DeleteProperty = {
  path: PropertyKey[];
  type: 'delete';
  key: PropertyKey;
};

/**
 * The interface that holds all delta types.
 *
 * You can extend this interface to define your own deltas.
 */
export interface DeltaTypes {
  'set': SetProperty;
  'create': CreateProperty;
  'delete': DeleteProperty;
}

export type Delta = DeltaTypes[keyof DeltaTypes];

