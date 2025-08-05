# JavaScript Object Watcher

This is a small and fun JavaScript package for monitoring changes made to
ordinary JavaScript objects.

## Exmaple

```ts
import { watch, Delta } from "@samvv/watch-object";

let bert: any = {
  fullName: 'Bert Stevens',
  email: 'bert.stevens@example.com',
  age: 24,
};

function onChange(delta: Delta): void {
    console.log(delta);
}

// Note the assignment!
// You MUST use the newly returned object if you want to monitor changes.
bert = watch(bert, { onChange });

// Will produce `{ type: 'set', key: 'age', value: 25, path: [] }`
bert.age++;

// Will produce `{ type: 'set', key: 'fullName', value: 'James Robinson', path: [] }`
bert.fullName = 'James Robinson';

// Will produce `{ type: 'delete', key: 'email', path: [] }`
delete bert.email;
```

## API Reference

To be done!
