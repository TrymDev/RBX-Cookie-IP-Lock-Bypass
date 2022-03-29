const fetch = require("node-fetch");  // This is node-fetch v2 but, v3 works

/*
--------------------------------------------------------

1# ~ Make a post request to https://auth.roblox.com/v1/authentication-ticket with the following header (be sure to add the cookie and csrf-token):
{
    "Content-Type": "application/json", 
    "user-agent":"Roblox/WinInet",
    "origin":"https://www.roblox.com", 
    "referer":"https://www.roblox.com/my/account", 
    "cookie": "RBX cookie", 
    'x-csrf-token': "csrf-token"
}

--------------------------------------------------------

2# ~ Get "rbx-authentication-ticket" from the response header and start a post request to https://auth.roblox.com/v1/authentication-ticket/redeem with the following header (dont forget the csrf token) and body:

headers: {
    "Content-Type": "application/json", 
    "rbxauthenticationnegotiation":1, 
    "user-agent":"Roblox/WinInet", 
    "origin":"https://www.roblox.com", 
    "referer":"https://www.roblox.com/my/account", 
    "x-csrf-token": csrf_token
}

body: JSON.stringify(
    {
        "authenticationTicket": THE AUTH TICKET YOU GOT FROM THE LAST REQUEST
    }
)

--------------------------------------------------------

3# ~ Get "set-cookie" from the response header and extract the cookie from the weird string (r_ticket.headers.get("set-cookie").split(`.ROBLOSECURITY=`)[1].split(`; domain`)[0]; )

--------------------------------------------------------

4# ~ Use the cookie in your request and repeat the process for any other requests <3

--------------------------------------------------------
*/


const sub_cookie = async function(key, token){
    try{
        var r_ticket = await fetch("https://auth.roblox.com/v1/authentication-ticket/redeem", {
            method: "POST",
            headers: {"Content-Type": "application/json", "rbxauthenticationnegotiation":1, "user-agent":"Roblox/WinInet", "origin":"https://www.roblox.com", "referer":"https://www.roblox.com/my/account", 'x-csrf-token': token},
            body: JSON.stringify({"authenticationTicket": key})
        });

        if (r_ticket.status!=200){
            var json = await r_ticket.json();
            if (r_ticket.status==429){
                console.log("   > Ratelimited while making cookie, delaying (60 seconds)");
                await delay(60000);
                return await sub_cookie(key);
            }else{
                console.log(json);
            };
        }else{
            var new_cookie = await r_ticket.headers.get("set-cookie").split(`.ROBLOSECURITY=`)[1].split(`; domain`)[0];
            return ".ROBLOSECURITY="+new_cookie;
        };
    }catch (err){
        console.log(err);
    };
};

const create_cookie = async function(cookie, token){
    try{
        var c_ticket = await fetch("https://auth.roblox.com/v1/authentication-ticket", {
            method: "POST",
            headers: {"Content-Type": "application/json", "user-agent":"Roblox/WinInet", "origin":"https://www.roblox.com", "referer":"https://www.roblox.com/my/account", "cookie": ".ROBLOSECURITY="+cookie, 'x-csrf-token': token}
        });

        if (c_ticket.status!=200){
            console.log(await c_ticket.json());
        }else{
            var ticket_key = await c_ticket.headers.get("rbx-authentication-ticket");
            if (ticket_key!=null){
                return await sub_cookie(ticket_key, token);
            };
        };

    }catch (err){
        console.log(err);
    };
};

var new_cookie = await create_cookie(cookie, csrf_token);