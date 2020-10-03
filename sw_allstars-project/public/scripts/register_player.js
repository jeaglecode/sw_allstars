//Sciprt for register a player for the tournament
"use strict";

//setting global vars
let teams = [];
let team = [];

//**** ready function */
$(function () {

    $.getJSON("api/teams", function (result) {
        teams = result;
        loadTeamDropDownList(teams);
    });

    // setting up submit handler
    $("#playerForm").on("submit", onPlayerFormSubmit);

    // setting on click handler
    $("#backPlayerBtn").on("click", onBackPlayerClick);
    $("#noCode").on("change", onChangeNoCode);

    //setting on blur
    $("#teamCode").blur(onTeamCodeBlur);
    $("#teams").blur(onTeamsSelectBlur);

    // setting reset button
    $("#resetPlayerBtn").on("click", onResetPlayerBtn);

    //removes message div on any input focus
    $("input:required").on("focus", function () {
        $("#messageDiv").html("");
    });

    //add dashes to phone field
    $("#playerPhone").keyup(function () {
        $(this).val($(this).val().replace(/(\d{3})-?(\d{3})-?(\d{4})/, '$1-$2-$3'));
    });
});

//**** function for checking no code */
function onChangeNoCode() {

    // remove message data
    $("#messageDiv").html("");

    // check if no code box is checked and set up fields
    if ($("#noCode").prop("checked")) {

        // readonly the team code and set empty
        $("#teamCode").prop("readonly", true).val("");

        // open up the drop down list
        $("#pickTeam").show();

        // set the dropdown box to select one (reset it)
        $("#teams option[value=-1]").prop("selected", true);

        // hide teamfield code dispaly
        $("#teamField").hide();

        //hide manager field field    
        $("#managerCodeField").hide();

        // remove min and max input prop
        $("#playerAge").removeAttr("min");
        $("#playerAge").removeAttr("max");
    }
    else {
        //open up the team access code field
        $("#pickTeam").hide();
        $("#teamCode").prop("readonly", false);
        $("#teamCode").focus();
    }
}

//** func to handle the blur event for team code blur */
function onTeamCodeBlur() {

    //remove any stale data
    $("#messageDiv").html("");

    // dont' show error code if no data was entered
    if ($("#teamCode").val() == "") {

        //remove the attribute of min and max
        $("#playerAge").removeAttr("min");
        $("#playerAge").removeAttr("max");

        //reset the dropdown
        $("#teams").val(-1);
        return;
    }

    // send back if code is empty or to short to parse
    if ($("#teamCode").val().length < 8) {

        //open the code field to show error mesaage
        $("#teamField").show();

        //remove the attribute of min and max
        $("#playerAge").removeAttr("min");
        $("#playerAge").removeAttr("max");

        //reset the dropdown
        $("#teams").val(-1);

        //write error code
        $("#teamField").html("Code not Found!");

        //write error code
        $("#managerCodeField").show();
        $("#managerCodeField").html("Please try again or use (Don't have a Code?)");
        return;
    }

    //get the val of the team selected
    let teamCode = $("#teamCode").val();

    // algo find the teamid out of the access code
    let lastIndex = teamCode.indexOf("-", 5);
    let teamId = teamCode.slice(5, lastIndex);

    //open up fields to write
    $("#teamField").show();
    $("#managerCodeField").show();

    //API to get the team info after finding it in the access code
    $.getJSON("api/teams/" + teamId, function (result) {
        team = result;
    })
        .done(function () {

            // sent the val of selected based on the code found    
            $("#teams").val(teamId);

            //show message what team and division based on the code found
            $("#teamField").html("Adding Player to: " + team.TeamName + " (" + team.League + " " + team.MinMemberAge + "-" + team.MaxMemberAge + ")");
            $("#managerCodeField").html("Manager Name: " + team.ManagerName);

            //set the min and max age for form validation
            $("#playerAge").prop("min", team.MinMemberAge);
            $("#playerAge").prop("max", team.MaxMemberAge);
        })
        .fail(function () {

            //if code not found than display error message   
            $("#playerAge").removeAttr("min");
            $("#playerAge").removeAttr("max");
            $("#teams").val(-1); //reset the val of dropdown set up error message
            $("#teamField").html("Code not Found!");
            $("#managerCodeField").html("Please try again or use (Don't have a Code?)");
        });
}

//**** func for handling on select blur */
function onTeamsSelectBlur() {

    // the teams id based on the dropdown selected    
    let teamId = $("#teams").val();

    //dont run code if select one was selected
    if (teamId != -1) {

        //open up fields to write
        $("#teamField").show();
        $("#managerCodeField").show();

        ///GET api for the selected val
        $.getJSON("api/teams/" + teamId, function (result) {
            team = result;

            //write message to user on team selected
            $("#teamField").html("Adding Player to: " + team.TeamName + " (" + team.League + " " + team.MinMemberAge + "-" + team.MaxMemberAge + ")");
            $("#managerCodeField").html("Manager Name: " + team.ManagerName);

            //open up access code filed if customer has a access code
            $("#pickTeam").hide();

            //remove the checkmark
            $("#noCode").prop("checked", false);

            //open the team access code input field
            $("#teamCode").prop("readonly", false);

            //set the age for validation
            $("#playerAge").prop("min", team.MinMemberAge);
            $("#playerAge").prop("max", team.MaxMemberAge);
        });
    }
}

//*** setting up the loading of team division dropdown list */
function loadTeamDropDownList(teams) {
    let teamsLength = teams.length;
    for (let i = 0; i < teamsLength; i++) {
        $("#teams").append($("<option>", {
            value: teams[i].TeamId,
            text: teams[i].TeamName + " " + "(" + teams[i].League + ")"
        }));
    }
}

//**** setting up the handling of the form submit */
function onPlayerFormSubmit() {

    //find the team id based on the select val
    let id = ($("#teams").val());

    //return if the val was not selected
    if (id == -1) {
        $("#messageDiv").html("Please choose a team to add a Player!").removeClass("text-success").addClass("text-danger");
        $("#teamCode").focus();
        return false;
    }

    //POST id the write the data to Json file
    $.post({
        url: "api/teams/" + id + "/members",
        data: {
            Email: $("#playerEmail").val(),
            MemberName: $("#playerName").val(),
            ContactName: $("#guardianName").val(),
            Age: $("#playerAge").val(),
            Gender: "Any",
            Phone: $("#playerPhone").val()
        }
    })

        // display message to DOM when .done is returned
        .done(function () {

            // show user message the player was added
            $("#messageDiv").html($("#playerName").val() + " was added to team " + team.TeamName + " (" + team.League + ")").removeClass("text-danger").addClass("text-success");
            $("#playerForm").trigger("reset");
            $("#teamField").html("");
            $("#managerCodeField").html("");
            $("#teamCode").prop("readonly", false);

            // focus on back button after player added
            $("#backPlayerBtn").focus();
        })

        //  display alert on a failed post
        .fail(function (xhr) {
            let errorMessage = xhr.status + ": " + xhr.statusText;
            alert(errorMessage);
        });

    return false;
}

// go to register page on the back button
function onBackPlayerClick() {
    window.location.href = "register.html";
}

//reset button handling to reset forms to start
function onResetPlayerBtn() {

    $("#teamField").html("");
    $("#managerCodeField").html("");
    $("#pickTeam").hide();
    $("#teamCode").prop("readonly", false).focus();
}