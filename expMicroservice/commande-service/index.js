const express = require("express");

const app = express();
const PORT = process.env.PORT_ONE || 4001;
const mongoose = require("mongoose")
const Commande = require("./Commande")
const axios = require('axios')
const isAuthenticated = require("./isAuthenticated")

mongoose.set('strictQuery', true)
/* mongoose.connect(
    "mongodb://localhost/commande-service",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Commande-Service DB Connected`);
    }
); */
mongoose.connect("mongodb://127.0.0.1/commande-service")
  .then(() => {
    console.log("commande-service DB Connected")
  })
  .catch((error) => console.log(error))
app.use(express.json());

function prixTotal(produits) {
    let total = 0;
    for (let t = 0; t < produits.length; ++t) {
        total += produits[t].prix;
    }
    return total;
}

async function httpRequest(ids) {
    try {
        const URL = "http://localhost:4000/produit/acheter"
        const response = await axios.post(URL, { ids: ids }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return prixTotal(response.data);
    } catch (error) {
        console.error(error);
    }
}
app.post("/commande/ajouter", isAuthenticated, async (req, res, next) => {
    const { ids } = req.body;
    httpRequest(ids).then(total => {

        const newCommande = new Commande({
            produits: ids,
            email_utilisateur: req.user.email,
            prix_total: total
        })
        newCommande.save()
            .then(commande => res.status(201).json(commande))
            .catch(error => res.status(400).json({ error }))
    });
});


app.listen(PORT, () => {
    console.log(`Commande-Service at ${PORT}`)
});

