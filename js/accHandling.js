const url = "https://bfyvolhralzalauadcsg.supabase.co";
const public_api = "sb_publishable_eI9Xb0qpcS0-yEEUJ-bAig_nLLL3b1_";
const sbTable = "ssPortfolio"

const supaClient = supabase.createClient(url, public_api);

// DOM VARIABLES
// TEXT BOXES
const user = document.querySelector(".acc-name");
const userMail = document.querySelector(".acc-mail");
const userPass = document.querySelector(".acc-pass");
const userInvCode = document.querySelector(".acc-invcode");
const nuserPass = document.querySelector(".new-pass");
const oluserPass = document.querySelector(".old-pass");
const keybEnter = document.querySelector(".submittable");

// NUSER/NUPASS 
const userPassChange = document.querySelector(".acc-passchange");
const nuPassBtn = document.querySelector(".pass-submit");
const nUserAccBtn = document.querySelector(".acc-submit");

// ACCOUNT HANDLING
const loginRedirect = document.querySelector(".login-redirect");
const userLogInBtn = document.querySelector(".acc-login");
const userLogOutBtn = document.querySelector(".acc-logout");
const userDelAccBtn = document.querySelector(".acc-del");
const artistOnly = document.querySelectorAll(".artist-only");
const artistCheck = document.querySelectorAll(".artist-check");


// DATA/ERROR HANDLING
async function sbIn(client) {
    const { data, error } = await client;
    if (error) {
        // console.log(error.code);
        throw error;
    }
    return data;
}

// SUBMIT TO SUPABASE 
async function accCreate() {
    const userMailLower = userMail.value.toLowerCase();
    if (!(user.value && userMail.value && userPass.value && userInvCode.value)) {
        return;
    }
    try {
        let userSlug = slugify(user.value);
        if (await userTaken(userSlug)) {
            console.log("Username has already been taken!");
            return;
        }

        const invCodeResult = await inviteCheck(userInvCode.value);
        if (invCodeResult === "invalid") {
            console.log("That invite code doesn't exist.");
            return;
        }

        if (invCodeResult === "used") {
            console.log("That invite code has already been used.");
            return;
        }

        await newUser(userMailLower, userPass.value, user.value, userInvCode.value);
    } catch (error) {
        // console.log(error)
    }
}

// INVITE CODE CHECK
async function inviteCheck(code) {
    const inviteResult = await sbIn(
        supaClient
        .rpc(
            'invite_check', {check_code: code}
        )
    )

    return inviteResult;
}

async function newUser(email, password, userName, invCode) {
    return sbIn(
        supaClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    display_name: userName,
                    invite_code: invCode
                },
                emailRedirectTo: 'https://davithy.github.io/project-ssf'
            }
        })
    )
    .then(goHome);
}

async function userTaken(name) {
    return sbIn(
        supaClient
        .from(sbTable)
        .select('username_slug')
        .eq('username_slug', name)
        .maybeSingle()
    )
}

// SELECTING ACTIVE ACCOUNT
async function currentUser() {
    try {
        const data = await sbIn(
            supaClient.auth.getUser()
        )
        return data.user;
    } catch (error) {
        return null;
    }
}

// VERIFY BEFORE CHANGING PASS
async function verifyPass() {
    if (!oluserPass) {
        if (!nuserPass.value) {
            return;
        }
        forgotPass(nuserPass.value);
    } else {
        if (!(nuserPass.value && oluserPass.value)) {
            return;
        }
        changePass(nuserPass.value, oluserPass.value);
    }
}

// CHANGING PASS
async function changePass(nuPass, olPass) {
    sbIn(
        supaClient.auth.updateUser({
            password: nuPass,
            current_password: olPass
        })
    )
}

// FORGOT PASSWORD REDIRECT
async function accPassChange() {
    if (!(userMail.value)) {
        return;
    }

    // console.log(userMail.value);

    await sbIn(
        supaClient.auth.resetPasswordForEmail(userMail.value, {
        redirectTo: 'https://davithy.github.io/project-ssf/artist/new-password/',
        })
    );
}

// FORGOT PASS
async function forgotPass(nuPass) {
    sbIn(
        supaClient.auth.updateUser({
            password: nuPass
        })
    )
}

// LOGIN VIA SUPABASE
async function accLogIn() {
    const userMailLower = userMail.value.toLowerCase();
    if (!(userMail.value && userPass.value)) {
        return;
    }

    logIn(userMailLower, userPass.value);
}

// ACCOUNT LOGIN LOGIC
async function logIn(email, password) {
    const currentSesh = await sbIn(
        supaClient.auth.signInWithPassword({
            email: email,
            password: password
        })
    );

    await sbIn(supaClient
        .from(sbTable)
        .update({is_online: 'TRUE'})
        .eq('uuid', currentSesh.user.id)
        .select()
    )
    .then(goHome);
};

// LOG IN/OUT BUTTON CHECK
async function updateUI() {
    const user = await currentUser();
    if (user) {
        if (userLogOutBtn) {userLogOutBtn.classList.remove("hidden");}
        if (artistCheck) {
            artistCheck.forEach(entry => {
                entry.classList.remove("artist-only")
            });
        }
    } else {
        if (loginRedirect) {loginRedirect.classList.remove("hidden");}
        if (userLogOutBtn) {userLogOutBtn.classList.add("hidden");}
    }

    // console.log(user);
}

// ACCOUNT LOGOUT LOGIC
async function accLogOut() {
    const currentSesh = await currentUser();
    
    await sbIn(supaClient
        .from(sbTable)
        .update({is_online: 'FALSE'})
        .eq('uuid', currentSesh.id)
        .select()
    );

    await sbIn(
        supaClient.auth.signOut()
    )
    .then(goHome);
}

// DELETE ACCOUNT LOGIC
async function accDelete() {
    try {
        await sbIn(supaClient.rpc('delete_account'));
        await supaClient.auth.signOut();
        goHome();
    } catch (error) {
        console.log(error);
    }
}

function slugify(text) {
  return text
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\_/g,'-')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function goHome() {
    setInterval(() => {
        window.location.href = "../../home/";
    }, 500)
}

function domPresent(dom, process) {
    if(dom) {dom.onclick = process};
}

async function potential() {

    const {data} = supaClient.auth.onAuthStateChange((event, session) => {
        updateUI();
        // console.log(event);
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
            if (document.body.dataset.authRedirect === "true") {
                goHome();
            }
        } // else if (event === 'SIGNED_OUT') {
        //     // handle sign out event
        // } else if (event === 'PASSWORD_RECOVERY') {
        //     // handle password recovery event
        // } else if (event === 'TOKEN_REFRESHED') {
        //     // handle token refreshed event
        // } else if (event === 'USER_UPDATED') {
        //     // handle user updated event
        // }
        });

    // console.log(data);
}

const doms = [
    // NEW USER
    [nUserAccBtn, accCreate],

    // NEW PASSWORD
    [userPassChange, accPassChange],
    [nuPassBtn, verifyPass],

    // ACCOUNT HANDLING
    [userLogInBtn, accLogIn],
    [userLogOutBtn, accLogOut],
    [userDelAccBtn, accDelete]
]

doms.forEach(([dom, process]) => domPresent(dom, process));

if (keybEnter) {
    keybEnter.addEventListener('keydown', (enter) => {
        if (enter.key !== 'Enter') return;
        document.querySelector('.submittable-target')?.click();
    })
}

potential();