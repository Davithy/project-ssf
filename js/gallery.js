Fancybox.bind("[data-fancybox]", {
})

const url = "https://tclzvnzmcqclngrsekfo.supabase.co";
const public_api = "sb_publishable_cM6Vc142F4i-KjpCnX_MeA_y_H6prOz";

const supabaseClient = supabase.createClient(url, public_api);

async function dataFetch() {
    const { data, error } = await supabaseClient
        .from('wreckSubmissions')
        .select('*');
    if (error) {
        console.log(error);
        throw error;
    }
    if (data) {
        return data;
    }
};

async function labelMaker() {
    const resultData = await dataFetch();
    const submissions = resultData;
    const resultNames = (submissions[0].profiles.map(profile => profile.name)); //rows
    const resultTypes = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy", "Unsure"]; //columns
    const resultCount = typeCounter(submissions, resultNames, resultTypes);
    
    const names = document.querySelectorAll('.team-name');

    names.forEach(name => {
        const nameLabel = name.innerText;
        const newName = nameLabel[0].toUpperCase() + nameLabel.slice(1).toLowerCase();
        // console.log(newName);
        
        const topTypes = topTypeFinder(resultCount[newName]);
        // console.log(resultCount[newName]);

        const teamCard = name.querySelector('.top-types')

        topTypes.forEach(type => {
            const topImages = document.createElement('img');
            topImages.classList.add("topTypes");
            
            if (type !== "Unsure") {
                topImages.src = `../assets/icons/${type.toLowerCase()}.svg`;
            } else {    
                topImages.src = "../assets/question.svg";
            }
            teamCard.appendChild(topImages);
        })
    });
}

function typeCounter(submissions, names, types) {
    const typeCount = {};

    names.forEach(name => {
        typeCount[name] = {};
        types.forEach(type => {
            if (type !== "") {
                typeCount[name][type] = 0;
            };
        });
    });

    submissions.forEach(submission => {
        submission.profiles.forEach((profile, index) => {
            const name = names[index];
            // console.log(name);
            profile.types.forEach(typeVal => {
                const type = typeVal.charAt(0).toUpperCase() + typeVal.slice(1);
                // console.log(typeCount[name]);
                if (typeCount[name] && typeCount[name][type] !== undefined) {
                    typeCount[name][type]++;
                }
            });
        });
    });

    return typeCount;
}

function topTypeFinder(typeFinder) {
    let topThree = []
    if (topThree.length < 3) {
        const test = Object.entries(typeFinder)
            .slice()
            .filter(([type, count]) => count > 0)
            .sort(function (a, b) { return b[1] - a[1]; })
            .slice(0,3)
            .map(([type, count]) => type);
        topThree = test;
    }
    return topThree;
}

labelMaker();