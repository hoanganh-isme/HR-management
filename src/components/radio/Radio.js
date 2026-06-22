/**
 * Custom Radio Component
 */
var UIControls = window.UIControls || {};

UIControls.createRadio = function(options) {
  var wrapper = document.createElement('label');
  wrapper.className = 'modern-radio-wrapper';

  var input = document.createElement('input');
  input.type = 'radio';
  input.className = 'modern-radio';
  
  if (options.name) input.name = options.name;
  if (options.value) input.value = options.value;
  if (options.checked) input.checked = true;

  input.addEventListener('change', function(e) {
    if (e.target.checked && typeof options.onChange === 'function') {
      options.onChange(e.target.value);
    }
  });

  var span = document.createElement('span');
  if (options.label) {
     span.innerHTML = options.label; // Use innerHTML to support elements like <span class="count">(51)</span>
  }

  wrapper.appendChild(input);
  wrapper.appendChild(span);

  return wrapper;
};

UIControls.createRadioGroup = function(options) {
  var group = document.createElement('div');
  group.className = 'modern-radio-group';
  
  var name = options.name || 'radio-group-' + Math.random().toString(36).substr(2, 9);
  
  options.items.forEach(function(item) {
    var radio = UIControls.createRadio({
      name: name,
      label: item.label,
      value: item.value,
      checked: item.checked || (options.value === item.value),
      onChange: options.onChange
    });
    group.appendChild(radio);
  });
  
  return group;
};
