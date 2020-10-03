let express = require("express");
let bodyParser = require("body-parser");
let fs = require("fs");

let app = express();

// Create application/x-www-form-urlencoded parser
let urlencodedParser = bodyParser.urlencoded({ extended: false });

// ------ Debugging support ------------------

function logArray(arr) {
    for (let i = 0; i < arr.length; i++) {
        console.log(arr[i]);
    }
}

// ------ Get next ID helper ------------------

function getNextId(counterType)  // use 'member' or 'team' as counterType
{
    // read the counter file
    let data = fs.readFileSync(__dirname + "/data/counters.json", "utf8");
    data = JSON.parse(data);

    // find the next id from the counters file and then increment the
    // counter in the file to indicate that id was used
    let id = -1;
    switch (counterType.toLowerCase()) {
        case "team":
            id = data.nextTeam;
            data.nextTeam++;
            break;
        case "member":
            id = data.nextMember;
            data.nextMember++;
            break;
    }

    // save the updated counter
    fs.writeFileSync(__dirname + "/data/counters.json", JSON.stringify(data));

    return id;
}

// ------ Search helpers ------------------

function getMatchingTeamById(id, data) {
    let match = data.find(t => t.TeamId == id);
    return match;
}

function getMatchingTeamsByLeague(leagueCode, data) {
    let matches = data.filter(t => t.League == leagueCode);
    return matches;
}

// ------ Membership change conflict helpers ------------------

function getMinAgeOfMember(team) {
    let minAge = 100000;
    for (let i = 0; i < team.Members.length; i++) {
        if (Number(team.Members[i].Age) < minAge) {
            minAge = Number(team.Members[i].Age);
        }
    }
    return minAge;
}

function getMaxAgeOfMember(team) {
    let maxAge = -1;
    for (let i = 0; i < team.Members.length; i++) {
        if (Number(team.Members[i].Age) > maxAge) {
            maxAge = Number(team.Members[i].Age);
        }
    }
    return maxAge;
}

function isThereAnyGenderChangeConflicts(newTeamGender, team) {
    if (newTeamGender == "Any") {
        // No conflict w/ team switching to coed
        return false;
    }

    let conflictGender = newTeamGender == "Male" ? "Female" : "Male";
    for (let i = 0; i < team.Members.length; i++) {
        // look for member whose gender would conflict with new team gender
        if (team.Members[i].Gender == conflictGender) {
            //console.log("Found member who is " + team.Members[i].Gender + " on a team witching to " + newTeamGender);
            return true;  // found a conflict!
        }
    }

    return false; // no conflicts
}

// ------ Validation helpers ------------------





function isValidTeam(team) {

    console.log("Val..");
    console.log(team);
    if (team.TeamName == undefined || team.TeamName.trim() == "")
        return 1;
    if (team.League == undefined || team.League.trim() == "")
        return 2;
    if (team.TeamCode == undefined || team.TeamCode.trim() == "")
        return 3;
    if (team.ManagerName == undefined || team.ManagerName.trim() == "")
        return 4;
    if (team.ManagerPhone == undefined || team.ManagerPhone.trim() == "")
        return 5;
    if (team.ManagerEmail == undefined || team.ManagerEmail.trim() == "")
        return 6;
    if (team.MaxTeamMembers == undefined || isNaN(team.MaxTeamMembers))
        return 7;
    if (team.MinMemberAge == undefined || isNaN(team.MinMemberAge))
        return 8;
    if (team.MaxMemberAge == undefined || isNaN(team.MaxMemberAge))
        return 9;
    if (team.TeamGender == undefined || team.TeamGender.trim() == "")
        return 10;
    if (team.TeamGender != "Any" && team.TeamGender != "Male" && team.TeamGender != "Female")
        return 11;

    return 0;
}

function isValidMember(member) {
    if (member.Email == undefined || member.Email.trim() == "")
        return false;
    if (member.MemberName == undefined || member.MemberName.trim() == "")
        return false;
    if (member.ContactName == undefined || member.ContactName.trim() == "")
        return false;
    if (member.Phone == undefined || member.Phone.trim() == "")
        return false;
    if (member.Age == undefined || isNaN(member.Age))
        return false;
    if (member.Gender == undefined || member.Gender.trim() == "")
        return false;
    if (member.Gender != "Any" && member.Gender != "Male" && member.Gender != "Female")
        return false;

    return true;
}

// ------------------------------------------------------------------------------
// THIS CODE ALLOWS REQUESTS FOR THE PAGES THROUGH

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/" + "index.html");
});

app.get("/index.html", function (req, res) {
    res.sendFile(__dirname + "/public/" + "index.html");
});



// TODO:  YOU WILL NEED TO ADD MORE CALLS TO app.get() FOR EACH PAGE
//        YOU END UP BUILDING



// ------------------------------------------------------------------------------
// THIS CODE ALLOWS REQUESTS FOR THE API THROUGH 

// GET LEAGUES
app.get("/api/leagues", function (req, res) {
    console.log("Received a GET request for leagues");

    let data = fs.readFileSync(__dirname + "/data/leagues.json", "utf8");
    data = JSON.parse(data);

    //console.log("Returned leagues are: ");
    //logArray(data)
    res.end(JSON.stringify(data));
});

// GET ALL TEAMS
app.get("/api/teams", function (req, res) {
    console.log("Received a GET request for ALL teams");

    let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
    data = JSON.parse(data);

    //console.log("Returned data is: ");
    //logArray(data);
    res.end(JSON.stringify(data));
});

// GET ONE TEAM BY ID
app.get("/api/teams/:id", function (req, res) {
    let id = req.params.id;
    console.log("Received a GET request for team " + id);

    let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
    data = JSON.parse(data);

    let match = getMatchingTeamById(id, data);
    if (match == null) {
        res.status(404).send("Not Found");
        return;
    }

    //console.log("Returned data is: ");
    //console.log(match);
    res.end(JSON.stringify(match));
});

// GET MANY TEAMS BY LEAGUE
app.get("/api/teams/byleague/:id", function (req, res) {
    let id = req.params.id;
    console.log("Received a GET request for teams in league " + id);

    let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
    data = JSON.parse(data);

    // find the matching teams for 
    let matches = getMatchingTeamsByLeague(id, data);

    //console.log("Returned data is: ");
    //logArray(matches);
    res.end(JSON.stringify(matches));
});

// GET A SPECIFIC MEMBER ON A SPECIFIC TEAM
app.get("/api/teams/:teamid/members/:memberid", function (req, res) {
    let teamId = req.params.teamid;
    let memberId = req.params.memberid;
    console.log("Received a GET request for member " + memberId + " on team " + teamId);

    let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
    data = JSON.parse(data);

    // find the team member on the team
    let team = getMatchingTeamById(teamId, data);
    if (team == null) {
        res.status(404).send("Team Not Found");
        return;
    }

    // find existing member on the team
    let match = team.Members.find(m => m.MemberId == memberId);
    if (match == null) {
        res.status(404).send("Member Not Found");
        return;
    }

    //console.log("Returned data is: ");
    //console.log("Member: " + memberId + " Name: " + match.memberName);
    res.end(JSON.stringify(match));
});

// ADD A TEAM
app.post("/api/teams", urlencodedParser, function (req, res) {
    console.log("Received a POST request to add a team");
    console.log("BODY -------->" + JSON.stringify(req.body));

    // assemble team information so we can validate it


    //creating teamCode for user
    let char1 = req.body.TeamName.substr(0, 1);
    let char2 = req.body.TeamName.slice(-1);
    let char3 = req.body.ManagerName.substr(0, 1);
    let char4 = req.body.ManagerName.slice(-1);
    let randomNumber = Math.floor((Math.random() * 10000) + 1);
    let teamId = getNextId("team"); //passed to the object
    //assemble the code
    let teamCode = char1 + char2 + "-" + char3 + char4 + teamId + "-" + randomNumber;

    let team = {
        TeamId: teamId,  // assign id to team //recevied from  creating team code
        TeamName: req.body.TeamName,
        League: req.body.LeagueCode,
        TeamCode: teamCode,
        ManagerName: req.body.ManagerName,
        ManagerPhone: req.body.ManagerPhone,
        ManagerEmail: req.body.ManagerEmail,
        MaxTeamMembers: Number(req.body.MaxTeamMembers),
        MinMemberAge: Number(req.body.MinMemberAge),
        MaxMemberAge: Number(req.body.MaxMemberAge),
        TeamGender: req.body.TeamGender,
        Members: []
    };

    console.log("Performing team validation...");
    let errorCode = isValidTeam(team);
    if (errorCode != 0) {
        console.log("Invalid  data! Reason " + errorCode);
        res.status(400).send("Bad Request - Incorrect or Missing Data");
        return;
    }

    console.log("Valid data!");

    let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
    data = JSON.parse(data);

    // add the team
    data[data.length] = team;

    fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

    console.log("New team added: ");
    console.log(team);
    // res.status(200).send();

    res.end(JSON.stringify(teamCode));
});

// EDIT A TEAM
app.put("/api/teams", urlencodedParser, function (req, res) {
    console.log("Received a PUT request to edit a team");
    console.log("BODY -------->" + JSON.stringify(req.body));

    // assemble team information so we can validate it
    let team = {
        TeamId: req.body.TeamId,
        TeamName: req.body.TeamName,
        League: req.body.LeagueCode,
        TeamCode: req.body.TeamCode,
        ManagerName: req.body.ManagerName,
        ManagerPhone: req.body.ManagerPhone,
        ManagerEmail: req.body.ManagerEmail,
        MaxTeamMembers: Number(req.body.MaxTeamMembers),
        MinMemberAge: Number(req.body.MinMemberAge),
        MaxMemberAge: Number(req.body.MaxMemberAge),
        TeamGender: req.body.TeamGender,
    };


    //console.log("Performing team validation...")
    let errorCode = isValidTeam(team);

    if (errorCode != 0) {
        console.log("Invalid  data! Reason Code: " + errorCode);
        res.status(400).send("Bad Request - Incorrect or Missing Data");
        return;
    }
    console.log("Valid data!");

    let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
    data = JSON.parse(data);

    // find team
    let match = getMatchingTeamById(req.body.TeamId, data);
    if (match == null) {
        res.status(404).send("Not Found");
        return;
    }

    // update the team
    match.TeamName = req.body.TeamName;
    match.League = req.body.LeagueCode;
    match.ManagerName = req.body.ManagerName;
    match.ManagerPhone = req.body.ManagerPhone;
    match.ManagerEmail = req.body.ManagerEmail;

    // make sure new values for max members, min/max age, or gender
    // don't conflict with members already on team

    if (Number(req.body.MaxTeamMembers) < match.Members.length) {
        res.status(409).send("Team size too small based on current roster");
        return;
    }
    match.MaxTeamMembers = Number(req.body.MaxTeamMembers);

    if (Number(req.body.MinMemberAge) > getMinAgeOfMember(match)) {
        res.status(409).send("Minimum age is greater than current member on team");
        return;
    }
    match.MinMemberAge = Number(req.body.MinMemberAge);

    if (Number(req.body.MaxMemberAge) < getMaxAgeOfMember(match)) {
        res.status(409).send("Maximum age is less than current member on team");
        return;
    }
    match.MaxMemberAge = Number(req.body.MaxMemberAge);

    if (isThereAnyGenderChangeConflicts(req.body.TeamGender, match)) {
        res.status(409).send("Gender change conflicts with current member on team");
        return;
    }
    match.TeamGender = req.body.TeamGender,


        fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

    console.log("Team updated!");
    console.log(match);
    res.status(200).send();
});

// DELETE A TEAM
app.delete("/api/teams/:id", function (req, res) {
    let id = req.params.id;
    console.log("Received a DELETE request for team " + id);

    let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
    data = JSON.parse(data);

    // find the index number of the team in the array
    let foundAt = data.findIndex(t => t.TeamId == id);

    // delete the team if found
    if (foundAt != -1) {
        match = data.splice(foundAt, 1);
    }

    fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

    //console.log("Team deleted!");
    //console.log(match);

    //Note:  even if we didn't find them, send a 200 because they are gone
    res.status(200).send();
});

// ADD A MEMBER TO A TEAM
app.post("/api/teams/:id/members", urlencodedParser, function (req, res) {
    let teamId = req.params.id;
    console.log("Received a POST request to add a member to team " + teamId);
    console.log("BODY -------->" + JSON.stringify(req.body));

    // assemble member information so we can validate it
    let member = {
        MemberId: getNextId("member"),   // assign new id
        Email: req.body.Email,
        MemberName: req.body.MemberName,
        ContactName: req.body.ContactName,
        Age: Number(req.body.Age),
        Gender: req.body.Gender,
        Phone: req.body.Phone
    };

    //console.log("Performing member validation...")
    if (!isValidMember(member)) {
        //console.log("Invalid  data!")
        res.status(400).send("Bad Request - Incorrect or Missing Data");
        return;
    }
    //console.log("Valid data!")

    let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
    data = JSON.parse(data);

    let match = getMatchingTeamById(teamId, data);
    if (match == null) {
        res.status(404).send("Team Not Found");
        return;
    }

    // make sure assignment doesn't violate team rules

    if (member.Age < match.MinMemberAge || member.Age > match.MaxMemberAge) {
        res.status(409).send("Member's age is outside of bounds of team age rules");
        return;
    }

    if (match.TeamGender != "Any" && member.Gender != match.TeamGender) {
        res.status(409).send("Member's gender does not conform to team gender rules");
        return;
    }

    // add the team
    match.Members[match.Members.length] = member;

    fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

    //console.log("New member added: ");
    //console.log("Name: " + member.MemberName)
    res.status(200).send();
});

// EDIT A MEMBER ON TEAM
app.put("/api/teams/:id/members", urlencodedParser, function (req, res) {
    let teamId = req.params.id;
    console.log("Received a PUT request to edit a member on team " + teamId);
    console.log("BODY -------->" + JSON.stringify(req.body));

    // assemble member information so we can validate it
    let member = {
        MemberId: req.body.MemberId,
        Email: req.body.Email,
        MemberName: req.body.MemberName,
        ContactName: req.body.ContactName,
        Age: Number(req.body.Age),
        Gender: req.body.Gender,
        Phone: req.body.Phone
    };

    //console.log("Performing member validation...")
    if (!isValidMember(member)) {
        console.log("Invalid  data!");
        res.status(400).send("Bad Request - Incorrect or Missing Data");
        return;
    }
    //console.log("Valid data!")

    // find the team
    let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
    data = JSON.parse(data);

    let team = getMatchingTeamById(teamId, data);
    if (team == null) {
        res.status(404).send("Team Not Found");
        return;
    }

    // find existing member on the team
    let match = team.Members.find(m => m.MemberId == req.body.MemberId);
    if (match == null) {
        res.status(404).send("Member Not Found");
        return;
    }

    // update the member
    match.Email = req.body.Email;
    match.MemberName = req.body.MemberName;
    match.ContactName = req.body.ContactName;
    match.Age = Number(req.body.Age);
    match.Gender = req.body.Gender;
    match.Phone = req.body.Phone;

    // make sure edit doesn't violate team rules

    if (match.Age < team.MinMemberAge || match.Age > team.MaxMemberAge) {
        res.status(409).send("Member's new age is outside of bounds of team age rules");
        return;
    }

    if (team.TeamGender != "Any" && match.Gender != team.TeamGender) {
        res.status(409).send("Member's new gender does not conform to team gender rules");
        return;
    }

    fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

    //console.log("Member edited: ");
    //console.log("Name: " + match.MemberName)
    res.status(200).send();
});

// DELETE A MEMBER ON TEAM
app.delete("/api/teams/:teamid/members/:memberid", urlencodedParser, function (req, res) {
    let teamId = req.params.teamid;
    let memberId = req.params.memberid;
    console.log("Received a DELETE request for member " + memberId + " on team " + teamId);

    // find the team
    let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
    data = JSON.parse(data);

    let team = getMatchingTeamById(teamId, data);
    if (team == null) {
        res.status(404).send("Team Not Found");
        return;
    }
    console.log("Found team!");

    // find existing member on the team
    let foundAt = team.Members.findIndex(m => m.MemberId == memberId);

    let match = null;
    // delete the member if found
    if (foundAt != -1) {
        match = team.Members.splice(foundAt, 1);
    }

    fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

    /*if (match != null)
    {
        console.log("Member deleted:");
        console.log("Member name: " + match.MemberName);
    }*/
    // Note:  even if we didn't find them, send a 200 back because they are gone
    res.status(200).send();
});


// ------------------------------------------------------------------------------
// SITE SET-UP

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

let server = app.listen(8081, function () {
    let port = server.address().port;

    console.log("App listening at port %s", port);
});
