import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    "colors": {
      "c10": {
        "name": "Jet Black",
        "hexa": "#000000",
        "render": "#000000",
        "pantone": "Black 6 C"
      },
      "c11": {
        "name": "Antracite",
        "hexa": "#434343",
        "render": "#434343",
        "pantone": "446 C"
      },
      "c12": {
        "name": "Dark gray",
        "hexa": "#666666",
        "render": "#666666",
        "pantone": "Cool gray 10 C"
      },
      "c13": {
        "name": "Grey",
        "hexa": "#b7b7b7",
        "render": "#b7b7b7",
        "pantone": "Cool gray 4 C"
      },
      "c14": {
        "name": "Light grey",
        "hexa": "#d9d9d9",
        "render": "#d9d9d9",
        "pantone": "Cool gray 1 C"
      },
      "c15": {
        "name": "Tidal foam",
        "hexa": "#a7a089",
        "render": "#a7a089",
        "pantone": "7536 C"
      },
      "c16": {
        "name": "Khaki",
        "hexa": "#c2b299",
        "render": "#c2b299",
        "pantone": "7535 C"
      },
      "c17": {
        "name": "Light khaki",
        "hexa": "#dfd8c8",
        "render": "#dfd8c8",
        "pantone": "7527 C"
      },
      "c18": {
        "name": "Coconut milk",
        "hexa": "#f0ede5",
        "render": "#f0ede5",
        "pantone": ""
      },
      "c19": {
        "name": "White",
        "hexa": "#ffffff",
        "render": "#ffffff",
        "pantone": ""
      },
      "c20": {
        "name": "Dark olive",
        "hexa": "#5f6738",
        "render": "#5f6738",
        "pantone": "5753 C"
      },
      "c21": {
        "name": "Olive",
        "hexa": "#586e26",
        "render": "#586e26",
        "pantone": "371 C"
      },
      "c22": {
        "name": "Piquant green",
        "hexa": "#799c4b",
        "render": "#799c4b",
        "pantone": "576 C"
      },
      "c23": {
        "name": "Green tea",
        "hexa": "#86a96f",
        "render": "#86a96f",
        "pantone": "577 C"
      },
      "c24": {
        "name": "Tendril",
        "hexa": "#94a26f",
        "render": "#94a26f",
        "pantone": "5777 C"
      },
      "c25": {
        "name": "Dark green",
        "hexa": "#124734",
        "render": "#124734",
        "pantone": "3435 C"
      },
      "c26": {
        "name": "Dark green",
        "hexa": "#005745",
        "render": "#005745",
        "pantone": "343 C"
      },
      "c27": {
        "name": "Kelly green",
        "hexa": "#1e874a",
        "render": "#1e874a",
        "pantone": "7731 C"
      },
      "c28": {
        "name": "Poison green",
        "hexa": "#38b665",
        "render": "#38b665",
        "pantone": "7739 C"
      },
      "c29": {
        "name": "Parrot green",
        "hexa": "#6bc04b",
        "render": "#6bc04b",
        "pantone": "360 C"
      },
      "c30": {
        "name": "Moroccan blue",
        "hexa": "#0e4156",
        "render": "#0e4156",
        "pantone": "3035 C"
      },
      "c31": {
        "name": "Celestial",
        "hexa": "#144d6a",
        "render": "#144d6a",
        "pantone": "7700 C"
      },
      "c32": {
        "name": "l blue",
        "hexa": "#007e97",
        "render": "#007e97",
        "pantone": "7697 C"
      },
      "c33": {
        "name": "Turquoise",
        "hexa": "#58b7b3",
        "render": "#58b7b3",
        "pantone": "7472 C"
      },
      "c34": {
        "name": "Clearwater",
        "hexa": "#aedde5",
        "render": "#aedde5",
        "pantone": "628 C"
      },
      "c35": {
        "name": "Patriot blue",
        "hexa": "#202945",
        "render": "#202945",
        "pantone": "533 C"
      },
      "c36": {
        "name": "Dark blue",
        "hexa": "#15224f",
        "render": "#15224f",
        "pantone": "2768 C"
      },
      "c37": {
        "name": "Royal Blue",
        "hexa": "#0b1f8f",
        "render": "#0b1f8f",
        "pantone": "2746 C"
      },
      "c38": {
        "name": " Diva blue",
        "hexa": "#007cbb",
        "render": "#007cbb",
        "pantone": "7690 C"
      },
      "c39": {
        "name": "Sky Blue",
        "hexa": "#5fb4e5",
        "render": "#5fb4e5",
        "pantone": "2915 C"
      },
      "c40": {
        "name": "Blackberry",
        "hexa": "#3c1740",
        "render": "#3c1740",
        "pantone": "2695 C"
      },
      "c41": {
        "name": "Purple",
        "hexa": "#673278",
        "render": "#673278",
        "pantone": "7664 C"
      },
      "c42": {
        "name": "Bright Violet",
        "hexa": "#7d4182",
        "render": "#7d4182",
        "pantone": "7662 C"
      },
      "c43": {
        "name": "Radiant orchid",
        "hexa": "#ac6eaa",
        "render": "#ac6eaa",
        "pantone": "7440 C"
      },
      "c44": {
        "name": "Persian violet",
        "hexa": "#a292b3",
        "render": "#a292b3",
        "pantone": "666 C"
      },
      "c45": {
        "name": "Pink",
        "hexa": "#d41568",
        "render": "#d41568",
        "pantone": "214 C"
      },
      "c46": {
        "name": "Smouth pink",
        "hexa": "#e64461",
        "render": "#e64461",
        "pantone": "198 C"
      },
      "c47": {
        "name": "Strawberry ice",
        "hexa": "#f0898b",
        "render": "#f0898b",
        "pantone": "1775 C"
      },
      "c48": {
        "name": "Sea pink",
        "hexa": "#f29eab",
        "render": "#f29eab",
        "pantone": "197 C"
      },
      "c49": {
        "name": "Barely pink",
        "hexa": "#fddfdd",
        "render": "#fddfdd",
        "pantone": "705 C"
      },
      "c50": {
        "name": "Burgundy",
        "hexa": "#73002b",
        "render": "#73002b",
        "pantone": "208 C"
      },
      "c51": {
        "name": "Aurora red",
        "hexa": "#b11e2e",
        "render": "#b11e2e",
        "pantone": "187 C"
      },
      "c52": {
        "name": "Full red",
        "hexa": "#cd1227",
        "render": "#cd1227",
        "pantone": "186 C"
      },
      "c53": {
        "name": "Tomato",
        "hexa": "#ea112c",
        "render": "#ea112c",
        "pantone": "185 C"
      },
      "c54": {
        "name": "Camellia",
        "hexa": "#fb5259",
        "render": "#fb5259",
        "pantone": "1785 C"
      },
      "c55": {
        "name": "Chocolate",
        "hexa": "#481400",
        "render": "#481400",
        "pantone": "4625 C"
      },
      "c56": {
        "name": "Mustang",
        "hexa": "#604436",
        "render": "#604436",
        "pantone": "7589 C"
      },
      "c57": {
        "name": "Iced coffee",
        "hexa": "#8d644b",
        "render": "#8d644b",
        "pantone": "876 C"
      },
      "c58": {
        "name": "Lion",
        "hexa": "#a07650",
        "render": "#a07650",
        "pantone": "4645 C"
      },
      "c59": {
        "name": "Croissant",
        "hexa": "#b39f6b",
        "render": "#b39f6b",
        "pantone": "4515 C"
      },
      "c60": {
        "name": "Dark orange",
        "hexa": "#c23c33",
        "render": "#c23c33",
        "pantone": "180 C"
      },
      "c61": {
        "name": "Tangerine",
        "hexa": "#e44e29",
        "render": "#e44e29",
        "pantone": "7597 C"
      },
      "c62": {
        "name": "Auttumn Glory",
        "hexa": "#ec8a0f",
        "render": "#ec8a0f",
        "pantone": "144 C"
      },
      "c63": {
        "name": "Peach",
        "hexa": "#f8724e",
        "render": "#f8724e",
        "pantone": "7416 C"
      },
      "c64": {
        "name": "Blooming dahlia",
        "hexa": "#ffa489",
        "render": "#ffa489",
        "pantone": "1625 C"
      },
      "c65": {
        "name": "Honey gold",
        "hexa": "#b78c1f",
        "render": "#b78c1f",
        "pantone": "7556 C"
      },
      "c66": {
        "name": "Lemon",
        "hexa": "#f8bf00",
        "render": "#f8bf00",
        "pantone": "7408 C"
      },
      "c67": {
        "name": "Buttercup",
        "hexa": "#f6cf3f",
        "render": "#f6cf3f",
        "pantone": "129 C"
      },
      "c68": {
        "name": "Goldfinch",
        "hexa": "#fbe446",
        "render": "#fbe446",
        "pantone": "106 C"
      },
      "c69": {
        "name": "French vanilla",
        "hexa": "#f9e08e",
        "render": "#f9e08e",
        "pantone": "1205 C"
      },
      "c70": {
        "name": "Neon orange",
        "hexa": "#ffac4e",
        "render": "#ffac4e",
        "pantone": "804 C"
      },
      "c71": {
        "name": "Neon pink",
        "hexa": "#ff41b4",
        "render": "#ff41b4",
        "pantone": "806 C"
      },
      "c72": {
        "name": "Neon yellow",
        "hexa": "#ffe900",
        "render": "#ffe900",
        "pantone": "803 C"
      },
      "c73": {
        "name": "Neon Green",
        "hexa": "#3ad531",
        "render": "#3ad531",
        "pantone": "802 C"
      },
      "c74": {
        "name": "Neon blue",
        "hexa": "#0098ce",
        "render": "#0098ce",
        "pantone": "801 C"
      },
      "c75": {
        "name": "Pastel red",
        "hexa": "#ffa6ba",
        "render": "#ffa6ba",
        "pantone": "Red 0331 C"
      },
      "c76": {
        "name": "Pastel magenta",
        "hexa": "#faa7db",
        "render": "#faa7db",
        "pantone": "Magenta 0521 c"
      },
      "c77": {
        "name": "Pastel yellow",
        "hexa": "#f4f0a2",
        "render": "#f4f0a2",
        "pantone": "Yellow 0131 c"
      },
      "c78": {
        "name": "Pastel green",
        "hexa": "#7ae5d3",
        "render": "#7ae5d3",
        "pantone": "Green 0921 C"
      },
      "c79": {
        "name": "Pastel blue",
        "hexa": "#50c9ea",
        "render": "#50c9ea",
        "pantone": "Blue 0821 C"
      }
    },
    activeMenu: []
  },
  mutations: {
    SET_MENU: (state, activeMenu) => {
      state.activeMenu = activeMenu
    }
  },
  actions: {
    SetMenu: ({commit, state}, activeMenu) => {
      commit('SET_MENU', activeMenu)
      return state.activeMenu
    }
  }
})
