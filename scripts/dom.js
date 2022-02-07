'use strict';

const dom = {
    create(typ, inhalt, parent, klassen) {
        //console.log(parent);
        const neu = document.createElement(typ);
        if (inhalt) neu.innerHTML = inhalt;
        if (parent) parent.appendChild(neu);
        if (klassen) neu.className = klassen.join(' ');
        return neu;
    },
    $(sel){
        return document.querySelector(sel);
    },
    $$(sel){
        return Array.from(document.querySelectorAll(sel));
    }
}