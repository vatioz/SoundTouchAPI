var soundTouchTest = (function() {
    // private
    function sayHelloPrivate() {
        alert("Hello private zones");
    }



    // public
    return  {
        sayHello: function() {
            sayHelloPrivate();
        },
    };
})();


