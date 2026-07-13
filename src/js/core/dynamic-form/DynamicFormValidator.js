window.DynamicFormValidator = {
  required: function (schema, values) {
    return (schema || []).filter(function (field) {
      return field.required && (values[field.name] === '' || values[field.name] == null);
    });
  }
};

