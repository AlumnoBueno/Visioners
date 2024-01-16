
export const logout =  async (req,res) =>{
    res.clearCookie("userSave");
    res.clearCookie("userAdmin");
    res.redirect("/");
}