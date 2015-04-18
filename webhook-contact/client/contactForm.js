contact = function(){
    var fireBase = window.ENV.dbName;


    var ref = new Firebase("https://"+ fireBase +".firebaseio.com/management/commands/mail/");

    var init = function(){
        $('form').submit(function(event) {

            // get the form data
            var formData = {};
            $( "input" ).each(function() {
                formData[this.name] = $(this).val();
            });
            $( "textarea" ).each(function() {
                formData[this.name] = $(this).val();
            });
            //console.print('TEST');
            // stop the form from submitting and refreshing
            ref.authAnonymously(function(error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                } else {
                    ref.push({
                        id:guid(),
                        from:"mail@creadibile.be",
                        to: window.ENV.toEmail,
                        subject:"You got mail",
                        message: JSON.stringify(formData)
                    }, function(error) {
                        if (error) {
                            $('#alert').removeClass('hidden');
                        } else {
                            $('#success').removeClass('hidden');
                        }
                    });
                }
            });

            event.preventDefault();
        });
    };

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
    return{init:init};
}();
contact.init();