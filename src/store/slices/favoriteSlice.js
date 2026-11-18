import {createSlice} from "@reduxjs/toolkit";


export const favoriteSlice = createSlice({
    name: "favorite",
    initialState: {
        favorite:[],
        subCatsVisible: true
    },
    reducers: {
        changeFav: (state, action) => {
            const targetId = String(action.payload.id);
            if (state.favorite.find((item) => String(item.id) === targetId)) {
                state.favorite = state.favorite.filter((item) => String(item.id) !== targetId);
                return;
            }

            state.favorite.push({
                link: action.payload.link,
                name: action.payload.name,
                id: action.payload.id,
                image: action.payload.image,
                categoryId: action.payload.categoryId,
            });
        },
        changeSubCatsVisible: (state, action) => {
            state.subCatsVisible = action.payload.subCatsVisible;
        }
    },
    
});

export const { changeFav, changeSubCatsVisible } = favoriteSlice.actions;

export default favoriteSlice.reducer;