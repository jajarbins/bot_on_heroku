function dialog1 (){
    console.log('on est venu te chercher petit?');
    [
        (session) => {
            session.send("Welcome to the dinner reservation.");
            builder.Prompts.time(session, "Please provide a reservation date and time (e.g.: June 6th at 5pm)");
        },
        (session, results) => {
            session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
            builder.Prompts.number(session, "How many people are in your party?");
        },
        (session, results) => {
            session.dialogData.partySize = results.response;
            builder.Prompts.text(session, "Whose name will this reservation be under?");
        },
        (session, results) => {
            session.dialogData.reservationName = results.response;
            
            // Process request and display reservation details
            session.send(`Reservation confirmed. Reservation details: Date/Time: ${session.dialogData.reservationDate} Party size: ${session.dialogData.partySize} Reservation name: ${session.dialogData.reservationName}`);
            session.endDialog();
        }
    ]
}

module.exports = dialog1;