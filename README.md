in-suggest
=================

in-suggest is simple input autocomplete, typeahead module.

Install
-------
Get file in `./dist`
```html
<link rel="stylesheet" href="in-suggest.min.css">
<script src="in-suggest.js"></script>
```

Using module
```
npm install in-suggest
```
```js
import InSuggest from 'in-suggest'
```

Usage
------
```html
<input id="my-input" type="text" placeholder="Enter a value">
```
```js
const myInput = new InSuggest('my-input', options)
```

### options

- __action(query, next)__ is fired when a key is pressed - _required_
    - __query__ - the current input value
    - __next__ - a callback function. you must give him an array

- __selected(data, next)__ is fired when an item is selected - _required_
    - __data__ - the object selected
    - __next__ - a callback function that takes a string in paramter. This string parameter set the input value

- __createItem(data)__ is called for each data passed by `action()` - _required_

### Classes
If you want override the style. Here the template
```html
<div class="in-suggest">
    <input class="in-suggest_input">
    <div class="in-suggest_menu">
        <div class="in-suggest_menu_item">
            // your element returned by createItem
        </div>
    </div>
</div>
```

#### Example
```js
const myData = ['foo', 'bar']
const simpleAutocomplete = new InSuggest('id', {
    action(query, next) {
        // return myData filtered by the current input value
        next(myData.filter(
            value => value.toLowerCase().startsWith(query.toLowerCase()))
        )
    },

    selected(d, next) {
        next(d) // d is 'foo' or 'bar' and the input value take d
    },

    createItem(d) {
        const item = document.createElement('div')
        item.innerHTML = d
        return item
    }
})
```
