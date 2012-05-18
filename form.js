var Form = function(object, options) {

  options || (options = {});

  this.object = object;
  this.object_name = options.name;

  this.input = function(field, input_options) {

    attrs = {};
    input_options || (input_options = {});

    value = this.object[field];

    attrs['type']   = getInputType(value);
    attrs['name']   = getInputName(this.object_name, field);
    attrs['id']     = getInputId(attrs['name']);
    attrs['value']  = (value != "") ? value : '';

    if(isArray(value)){
      input_html = [];

      switch(input_options['as']){
        case 'select':
          delete(attrs['value']);
          delete(attrs['type']);

          attrs['multiple'] = "multiple";

          for(i in input_options['collection']){
            item = input_options['collection'][i];
            
            if(isValueInCollection(value, item.id))
              input_html.push('<option value="' + item.id + '" selected="selected">' + item.name + '</option>');
            else
              input_html.push('<option value="' + item.id + '">' + item.name + '</option>');
          }
          
          input_html_wrapper = '<select ' + mergeAttributes(attrs) + '>' + input_html.join('\n') + '</select>';
          
          return input_html_wrapper;
        break;
        case 'checkbox':
        default:
          attrs['name'] += "[]";
          for(i in input_options['collection']){
            item = input_options['collection'][i];

            attrs['value'] = item.id;
            attrs['id'] = getInputId(attrs['name']) + i;

            if(isValueInCollection(value, item.id))
              attrs['checked'] = "checked";
            else
              delete(attrs['checked']);

            input_html.push('<input ' + mergeAttributes(attrs) + ' />' + item.name);
          }

          return input_html.join('');
        break;
      }
    }
    else {
      if(attrs['type'] == 'text' && (input_options['as'] == 'textarea' || attrs['value'].length > 200)) {
        value = attrs['value'];
        attrs = {
          name: attrs['name'],
          id: attrs['id']
        };
        input_html = '<textarea ' + mergeAttributes(attrs) +'>' + value + '</textarea>';
      }
      else
        if(input_options['collection'] && isArray(input_options['collection'])){
          switch(input_options['as']){
            case 'radio':
              input_html = createInputsAsRadio(input_options['collection'], value, attrs);
            break;
            case 'select':
            default:
              input_html = createInputsAsSelect(input_options['collection'], value, attrs);
            break;
          }
        }
        else{
          if(isBoolean(value) && value.toString() == 'true')
            attrs['checked'] = "checked";
          else
            delete(attrs['checked']);

          input_html = '<label>' + field +'</label><input ' + mergeAttributes(attrs) + ' />';
        }
    }
    
    return input_html;
  };

  isArray = function(value) {
    return (value.push != undefined);
  };
  isBoolean = function(value) {
    return (value.toString() == 'true' || value.toString() == 'false');
  };
  isNumber = function(value) {
    return (!isBoolean(value) && value.toString().length > 0 && isFinite(value));
  };
  isString = function(value) {
    return typeof(value);
  };

  getInputType = function(value) {
    if(isNumber(value))
      type = 'number';
    else if(isBoolean(value) || isArray(value))
      type = 'checkbox';
    else if(isString(value))
      type = 'text';

    return type;
  };

  mergeAttributes = function(attrs) {
    attrs_array = [];
    for(key in attrs){
      attrs_array.push(key + '="' + attrs[key] + '"');
    }
    return attrs_array.join(' ');
  };

  getInputId = function(name) {
    return name.replace(/\[/g, '_').replace(/\]/g, '');
  };
  getInputName = function(object_name, field) {
    if(object_name)
      name = object_name + "["+field+"]";
    else
      name = field;

    return name;
  };

  isValueInCollection = function(collection, value) {
    collection_ids = [];

    for(i in collection){
      collection_ids.push(collection[i].id);
    }
    return collection_ids.indexOf(value) > -1;
  }

  createInputsAsRadio = function(collection, value, attrs) {
    input_html = [];
    attrs['name'] += "[]";

    for(i in collection){
      option = collection[i];

      attrs['type']   = 'radio';
      attrs['value']  = option;
      attrs['id']     = getInputId(attrs['name']) + i;

      if(option == value)
        input_html.push('<label>' + option +'</label><input ' + mergeAttributes(attrs) + ' checked="checked" />');
      else
        input_html.push('<label>' + option +'</label><input ' + mergeAttributes(attrs) + ' />');
    }

    input_html_wrapper = input_html.join(' ');

    return input_html_wrapper;
  };
  createInputsAsSelect = function(collection, value, attrs) {
    input_html = [];

    for(i in collection){
      option = collection[i];
      if(option == value)
        input_html.push('<option value="' + option + '" selected="selected">' + option + '</option>');
      else
        input_html.push('<option value="' + option + '">' + option + '</option>');
    }

    input_html_wrapper = '<select ' + mergeAttributes(attrs) + '>' + input_html.join('\n') + '</select>';
    
    return input_html_wrapper;
  };
};