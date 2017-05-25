function validateForm(form) {
    // loop through the inputs, checking for status
    var inputs = form.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++) {
        // make sure things are ok
            if(inputs[i].value == ""){
                // found empty field, alert!
                alert("Please fill all required fields");
                return false;
            }
            if(inputs[i].value.match(/[-\/\\^$*+?.()|[\]{}]/g)) {
              // found weird characters field, alert!
              alert("Please provide the proper characters. We dont allow hackers.");
              return false;
            }
    }
    return true;
}
