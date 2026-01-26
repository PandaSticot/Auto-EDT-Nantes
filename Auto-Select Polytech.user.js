// ==UserScript==
// @name         Auto-Select Polytech (Intelligent & Mémoire)
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Apprend ton choix et le retient pour toujours.
// @author       PandaSticot
// @match        https://edt-v2.univ-nantes.fr/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Clés pour le "calepin" (localStorage)
    const KEY_ID = 'mon_edt_id_v6';
    const KEY_NOM = 'mon_edt_nom_v6';

    // Vérifie si on a déjà une sauvegarde
    const idSauvegarde = localStorage.getItem(KEY_ID);
    const nomSauvegarde = localStorage.getItem(KEY_NOM);

    // ================= CAS 1 : C'EST LA PREMIÈRE FOIS (OU APRÈS RESET) =================
    if (!idSauvegarde) {
        console.log("EDT Auto: Aucun profil sauvegardé. Mode apprentissage activé.");

        // On attend que l'utilisateur clique sur une case à cocher
        const groupsContainer = document.getElementById('educational_groups');

        if (groupsContainer) {
            groupsContainer.addEventListener('change', function(e) {
                // Si l'élément cliqué est une case à cocher (input checkbox)
                if (e.target && e.target.type === 'checkbox') {

                    const idChoisi = e.target.id;
                    // Trouver le label associé pour avoir le nom
                    const label = document.querySelector(`label[for="${idChoisi}"]`);
                    const nomChoisi = label ? label.innerText.trim() : "Inconnu";

                    // On confirme avec l'utilisateur
                    if (confirm(`Voulez-vous définir "${nomChoisi}" comme votre emploi du temps par défaut ?`)) {
                        // ON ÉCRIT DANS LE CALEPIN
                        localStorage.setItem(KEY_ID, idChoisi);
                        localStorage.setItem(KEY_NOM, nomChoisi);

                        alert("C'est noté ! La prochaine fois, ce cours sera sélectionné automatiquement.");
                    }
                }
            });
        }
    }

    // ================= CAS 2 : ON CONNAÎT DÉJÀ LE COURS =================
    else {
        console.log(`EDT Auto: Profil détecté pour "${nomSauvegarde}" (${idSauvegarde})`);

        // 1. Ajouter un petit bouton "Reset" pour changer de classe si besoin
        ajouterBoutonReset(nomSauvegarde);

        // 2. Lancer la sélection automatique (Ta logique précédente)
        selectionnerEtVerifier(idSauvegarde, nomSauvegarde);
    }

    // --- FONCTIONS UTILITAIRES ---

    function selectionnerEtVerifier(idCible, nomAttendu) {
        let compteur = 0;
        const intervalle = setInterval(() => {
            compteur++;

            // A. Cocher la case
            const checkbox = document.getElementById(idCible);
            if (checkbox && !checkbox.checked) {
                 // Petite vérif de sécurité du nom
                 const label = document.querySelector(`label[for="${idCible}"]`);
                 if (label && label.innerText.trim() === nomAttendu) {
                     checkbox.click();
                     console.log("EDT Auto: Clic automatique effectué.");
                 }
            }

            // B. Vérifier si l'affichage est là (Ta méthode squelette)
            const squelette = document.querySelector('.fc-content-skeleton');
            if (squelette) {
                 const conteneurs = squelette.querySelectorAll('.fc-event-container');
                 for (let container of conteneurs) {
                    if (container.children.length > 0) {
                        console.log("EDT Auto: Emploi du temps visible !");
                        clearInterval(intervalle);
                        return;
                    }
                 }
            }

            // Stop après 5 secondes
            if (compteur > 10) clearInterval(intervalle);

        }, 500);
    }

    function ajouterBoutonReset(nomActuel) {
        // On attend un peu que la barre de recherche apparaisse
        setTimeout(() => {
            const searchBox = document.getElementById('searchBox');
            if (searchBox) {
                // Création du bouton
                const btn = document.createElement('button');
                btn.innerText = "Changer ma classe";
                btn.title = `Actuellement configuré pour : ${nomActuel}`;
                // Style rapide pour que ce soit joli
                btn.style.marginLeft = "10px";
                btn.style.padding = "5px 10px";
                btn.style.backgroundColor = "#d9534f"; // Rouge
                btn.style.color = "white";
                btn.style.border = "none";
                btn.style.borderRadius = "4px";
                btn.style.cursor = "pointer";

                // Action du bouton : On efface le calepin et on recharge la page
                btn.onclick = function(e) {
                    e.preventDefault(); // Empêche le site de faire autre chose
                    if(confirm("Voulez-vous oublier la configuration actuelle et choisir une nouvelle classe ?")) {
                        localStorage.removeItem(KEY_ID);
                        localStorage.removeItem(KEY_NOM);
                        location.reload(); // Recharge la page
                    }
                };

                // Insérer le bouton juste après la barre de recherche
                searchBox.appendChild(btn);
            }
        }, 1000);
    }

})();
