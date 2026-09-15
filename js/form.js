Fancybox.bind("[data-fancybox]", {
})

const url = "https://tclzvnzmcqclngrsekfo.supabase.co";
const public_api = "sb_publishable_cM6Vc142F4i-KjpCnX_MeA_y_H6prOz";

const supabaseClient = supabase.createClient(url, public_api);

async function dataWrite(submitters, profile) {
    const { error } = await supabaseClient
        .from('wreckSubmissions')
        .upsert({
            submitter: submitters,
            profiles: profile
        }, 
        {
            onConflict: 'submitter'
        })
        .select()

    if (error) {
        console.log(error);
        throw error;
    }
};

// total global vars
let activeIndex = 0;
const user = document.querySelector("#name-inp");
const submitBtn = document.querySelector(".submission-btn");
const resultBtn = document.querySelector(".results-btn");

// name dropdown vars
const nameMenu = document.querySelector('.name-menu');
const navCheck = document.querySelector('#nav-check');
const nameBtn = nameMenu.querySelector('#name-toggle span');
const namePnl = nameMenu.querySelector('.name-pnl');
const optionList = namePnl.querySelectorAll('.name-opt');
const completionState = nameMenu.querySelector('.name-opt img');
const options = namePnl.querySelectorAll('.name-opt h3');
const optionsArr = Array.from(options);
const scQuery = window.matchMedia("(min-width: 1201px)");

// checkbox grid vars
const typeChoice = document.querySelectorAll('.choice .choice-checker');
const clearChoice = document.querySelector('.clear-all .choice-checker');

const tooltipTeaser = document.querySelector('.tooltip-check');
const tooManyTeaser = document.querySelector('.toomany-check');

const choiceProfile = optionsArr.map((option, index) => ({
    id: index,
    name: option.textContent.trim(),
    types: [],
    complete: false
}));

// Disables checkboxes
function indexCheck() {
    if (activeIndex == 0) { 
        typeChoice.forEach(choice => {
            choice.disabled = true;
        })
    } else {
        typeChoice.forEach(choice => {
            choice.disabled = false;
            choiceProfile[0].complete = true;
        })
    } 
}

// Changes status from incomplete = complete
function progressStatus() {
    const progress = document.querySelectorAll('.progress');
    if (choiceProfile[activeIndex].complete) {
        progress[activeIndex].src = 'assets/tick-circle.png';
    } else {
        progress[activeIndex].src = 'assets/x-circle.png';
    }
}

// Loads checkboxes depending on chosen name
function profileLoadout() {
    typeChoice.forEach(cbRecall => {
        cbRecall.checked = choiceProfile[activeIndex].types.includes(cbRecall.dataset.type);
    });
}

// Clears all options
function clearAll() {
    typeChoice.forEach(checkbox => {
        checkbox.checked = false;
        choiceProfile[activeIndex].complete = false;
        choiceProfile[activeIndex].types = [];
        progressStatus();
    });
// Testing purposes --console.log("working on it.")
}

// As it says, submits the form to back end
function formSubmit() {
    if (choiceProfile.every(cbox => cbox.complete == true)) {
        // Testing purposes --console.log("You're all done now! Congratulations!");
        submitBtn.querySelector('.submission-check').dataset.src = "#submission-complete";
    } else {
        return;
        // Testing purposes --console.log(choiceProfile);
    }
}

// WRITES TO SUPABASE
async function nameCheck() {
    const cleanProfile = choiceProfile.slice(1);
    // Testing purposes --console.log(cleanProfile);
    const nameVal = user.value;
    if (!nameVal) { return; }
    dataWrite(nameVal.toUpperCase(), cleanProfile)
        .then (() => {
        window.location.href = "results/";
    });
}

// BRINGS UP TOOLTIP IF TOO MANY PEOPLE HAVE ONLY 2 TYPES
function typeTeaser(choiceProfile) {
    const lilTyped = choiceProfile.filter(profile =>
        profile.types.length >= 1 && profile.types.length <= 2
    );

    const manyTyped = choiceProfile.filter(profile =>
        profile.types.length >= 3
    );

    return lilTyped.length >= 4 && manyTyped.length === 0;
}

// DROPDOWN NAME PICKER CODE
optionList.forEach((li, index) => {
    li.addEventListener("click", function() {
        optionList.forEach(name => name.classList.remove('selected'));
        li.classList.add('selected');
        nameBtn.textContent = li.textContent.trim();
        if (!scQuery.matches) {
            navCheck.checked = false;
        }
        activeIndex = index;
        indexCheck();
        profileLoadout();
    });
});

// POKEMON TYPE PICKER CODE
typeChoice.forEach(checkbox => {
    checkbox.addEventListener("click", function() {
        const pkmnType = checkbox.dataset.type;
        const nameChoImg = optionList[activeIndex].querySelector('.chosen-types');
        const activeProfile = choiceProfile[activeIndex].types;
            
        if (pkmnType == "Clear All") { nameChoImg.innerHTML = ''; return };

        if (checkbox.checked) {
            // Testing purposes --console.log(pkmnType);
            choiceProfile[activeIndex].types.push(pkmnType);
            const sourceImg = checkbox.nextElementSibling.querySelector('.choice-icon img');
            const imgClone = sourceImg.cloneNode();
            imgClone.dataset.type = pkmnType;
            nameChoImg.appendChild(imgClone);
            
        } else {
            choiceProfile[activeIndex].types = choiceProfile[activeIndex].types.filter((unchecked) => unchecked !== pkmnType);

            const imgRemove = nameChoImg.querySelector('[data-type="'+ pkmnType + '"]');
            if (imgRemove) imgRemove.remove();
            
            // Testing purposes --console.log(choiceProfile[activeIndex].types);
        }

        if (activeProfile.length <= 6) {
            tooManyTeaser.checked = false;
        }

        if (activeProfile.length >= 7) {
            tooManyTeaser.checked = true;
            // console.log("That's a few too many!");

            const removeCB = Array.from(typeChoice).find(cb => cb.dataset.type === activeProfile[0])
            if (removeCB) {
                removeCB.checked = false;
                const imgRemove = nameChoImg.querySelector(`[data-type = "${removeCB.dataset.type}"]`);
                if (imgRemove) imgRemove.remove();
                // console.log(removeCB.dataset.type);
            }
            activeProfile.shift();
        }

        choiceProfile[activeIndex].complete = Array.from(typeChoice).some(cbox => cbox.checked);

        tooltipTeaser.checked = typeTeaser(choiceProfile);
        // Testing purposes --console.log(choiceProfile[activeIndex]);

        progressStatus();
    })
});

// CLEAR ALL OPTIONS CODE
clearChoice.addEventListener("click", function() {
    if (clearChoice.checked) {
        clearAll();
    }
});

navCheck.checked = false;
clearAll();
indexCheck();

submitBtn.onclick = formSubmit;
resultBtn.onclick = nameCheck;