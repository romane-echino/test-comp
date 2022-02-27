# Echino UI SDK & DSP Specification / Manifest

> Author : Echino SA
> Version : [PACKAGE_VERSION]
> Dev team :  Joé Butikofer, Donnet Romane
> Last modified : 04.12.2020

## Create an Echino UI Component Library

```bash
npx create-echino-component-library FOLDER_NAME
```

Then give your package name :

* @COMPANY/PACKAGE_NAME
* PACKAGE_NAME

```bash
cd FOLDER_NAME
code . #to open vs code in this folder then open a terminal CTRL+SHIFT !

npm start # to start project
npm run add # to add a new component
npm run build # test build dsp and bundle from project
npm run publish # send package to echino component marketplace
```

## Configure a component manifest

Go to your component manifest.json file

```json
{
  "name": "Text Input", //Compononent human readable name
  "menu": "", //Menu category see menu_categories
  "preventChildRender":false  //announce to SPA render that you will render your children
                              //yourself. class props must extends IHandleChildrenRenderProps
  "props": [ //User can modify thoses properties
    {
      "name": "title", //field name into the propse
      "displayName": "Title", // human readable field name
      "type": "string", //see prop_types
      "required": true, //wether the field props is required
      "default": "My Title" //prop default value
    }
  ],
  "bindable":[ //properties affected by onPropertyChanged event
    "value"
  ],
  "snippets":{
    "react":"<MyComponent props="hello world"></MyComponent/>" 
  }
}
```

### Root manifest properties

Name | Description | Default
--- | --- | ---
name |  | 
menu |  | 
props |  |
childrenProps |  | 
children | set of constraint on children or false |  
bindable |  | 
snippets |  | empty


### Menu categories

TBD

### Prop types

For each props you declare in your component’s props interface you have to declare it in the manifest if you want the user to be able to change it via the Editor UI.

So firstly declare your props inside your component :

```typescript
interface IMyComponentProps {
  value: string;
}
```

Then add the reference to your props fields inside the manifest within the “props” json array :

```json
"props": [
  {
    "name": "value",
    "displayName": "Value",
    "type": "string"
  },
],
```

### Props

There are several properties to describe your props for the Editor and here are they :

| Property | Description |
| - | - |
name | value name inside the props interface of the corresponding component
displayName | Human readable name of the value. Will appear inside the editor
type | Value type (see: Props types)
default | Default value inside the editor (see: Props types)
required | Wether the value is required or not

### Children Props
Children props, also called inherited props are props that are present on a component but belongs to a direct parent.
Example :
```xml
  <Layout>
    <Label Layout.Top="10"/> 
  </Layout>
```
Here Top is on Label but really belongs to and is used by Layout

Children props have the same definition syntax as props.

### Props types

Here are the property types

| Type | Description | default field sample |
| - | - | - |
string | A string of characters | “default”:”some text”
boolean | A true/false value | “default”:true
number | A number or float | “default”:0.55
integer | An integer number | “default”:99
color | A CSS color (https://www.w3schools.com/css/css_colors.asp) | “default”:”red” “default”:”#ff0000”
object | Complexe type object | “default”:
array | Complexe type array | “default”:
function | Complexe type function | “default”:

## Children

Children are elements that go “inside” the component :

```xml
    <Layout>
      <Label />
    </Layout>
```


## Snippets

???

## Bindings

If you want to read a property of your components from another one and also detect its changes you have to implements bindings in the manifest and the compoent itself here’s how :

First add “bindable” and all of your properties name inside the manifest

```json
"bindable":[
  "value"
]
```

Be sure to add the interface BindableComponent to your props interface 

```typescript
import { IBindableComponentProps } from '@echino/echino.ui.sdk'

interface IMyComponentProps extends IBindableComponentProps  {
  value: string;
}
```

Then detect value changes and send the change event

```typescript
private _updateValue = (value: string) => {
  let oldValue = this.state.value;
  this.setState({ value: value });

  this.props.onPropertyChanged('value', oldValue, value);
};
```

## Prevent children rendering

In case you want the engine not to render components children place the following inside your component’s manifest.json

```json
"preventChildRender":true
```

That also allows you to handle the children render by yourself (ex: ForEach) by extending your component’s props with IHandleChildrenRenderProps. You’ll be adble to call a function directly onto the engine to render the children when you desire.

```typescript
import { IHandleChildrenRenderProps } from '@echino/echino.ui.sdk'

interface IMyComponentProps extends IHandleChildrenRenderProps {
}

private _childUpdated = () => {
  this.props.renderChildComponent();
};
```