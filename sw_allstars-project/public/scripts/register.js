// Script to add a team to the tournament 
"use strict";

//setting of global league var
let leagues = [];

//ready function
$(function () {

    // getting data to load to register dropdown list
    $.getJSON("api/leagues", function (result) {
        leagues = result;
        loadLeaguesDropDownList(leagues);
    });

    // setting up event handling
    //form handler button
    $("#registerForm").on("submit", onFormSubmit);

    //setting up on click event for adding to tournament
    $("#addTeamBtn").on("click", onAddTeamClick);
    $("#addPlayerBtn").on("click", onAddPlayerClick);

    // setting up bottom for form buttons
    $("#backBtn").on("click", onBackClick);
    $("#codeBtn").on("click", onCodeBtnClick);
    $("#resetBtn").on("click", onResetBtnClick);

    // remove messages on focus
    $("input:required").on("focus", function () {
        $("#messageTeamDiv").html("");
        $("#codeWrapper").hide();

    });

    //add dashes to phone field
    $("#phone").keyup(function () {
        $(this).val($(this).val().replace(/(\d{3})-?(\d{3})-?(\d{4})/, '$1-$2-$3'));
    });
});

//**** load data into drop down list */
function loadLeaguesDropDownList(leagues) {

    let leaguesLength = leagues.length;
    for (let i = 0; i < leaguesLength; i++) {
        $("#division").append($("<option>", {
            value: leagues[i].Name,
            text: leagues[i].Name + " " + "(" + leagues[i].Description + ")"
        }));
    }
}

//on add team close button and show form
function onAddTeamClick() {
    $("#registerButtons").hide();
    $("#registerTeam").show();
}

//on add player open register player page
function onAddPlayerClick() {
    // $("#registerButtons").hide();
    // $("#registerPlayer").show();
    window.location.href = "register_player.html";
}

//on back button reset form and show menu
function onBackClick() {
    $("#registerForm").trigger("reset");
    $("#registerTeam").hide();
    $("#registerButtons").show();
}

//**** form submit handling */
function onFormSubmit() {

    // if no divsion was seleted error handling return false
    if ($("#division").val() == -1) {

        $("#messageTeamDiv").html("Please choose a division for your team.").removeClass("text-success").addClass("text-danger text-center");
        $("#division").focus();

        return false;
    }

    //get the min and max age
    let ages = getMinandMaxAge();

    //API post to add team
    $.post({
        url: "api/teams",
        data: {
            TeamName: $("#teamName").val(),
            LeagueCode: $("#division").val(),
            ManagerName: $("#managerName").val(),
            ManagerPhone: $("#phone").val(),
            ManagerEmail: $("#email").val(),
            MaxTeamMembers: "20",
            MinMemberAge: ages[0],
            MaxMemberAge: ages[1],
            TeamGender: "Any"
        }
    })

        // display message to DOM when .done is returned
        .done(function (data) {

            // getting back the access code from the server
            let accessCode = JSON.parse(data);

            // SUCCESS to add team message and show copy access code button to the screen 
            $("#messageTeamDiv").html("Your team " + $("#teamName").val() + " was successfully added to the tournament! Below is your team code, you can copy it to add a player to your team.").removeClass("text-danger text-center").addClass("text-success");

            // reset form and focus on back button
            $("#registerForm").trigger("reset");
            $("#backBtn").focus();

            // display the access Ccode    
            displayCopyAccessCode(accessCode);

        })

        //  display alert on a failed post fallback should not ever alert  
        .fail(function (xhr) {
            let errorMessage = xhr.status + ": " + xhr.statusText;
            alert(errorMessage);
        });

    return false;
}

//find the age based on the league seleted and send ages array back
function getMinandMaxAge() {
    let ages = [];
    let leagueSelected = $("#division").val();

    if (leagueSelected == "Tee Ball") {
        ages = [4, 6];
    }
    else if (leagueSelected == "Minors") {
        ages = [7, 9];
    }
    else if (leagueSelected == "Majors") {
        ages = [10, 12];
    }
    else {
        ages = [12, 14];
    }
    return ages;
}

// show the accesscode to the user
function displayCopyAccessCode(accessCode) {
    $("#codeWrapper").show();
    $("#codeDiv").val(accessCode);
    $("#codeBtn").html("Copy Code");
}

// function to copy the access code to memory
function onCodeBtnClick() {
    $("#codeDiv").select();
    document.execCommand("Copy");
}

// reset button get rid of stale data
function onResetBtnClick() {
    $("#messageTeamDiv").html("");
    $("#codeWrapper").hide();
    $("#teamName").focus();
}
