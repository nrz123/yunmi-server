let e=()=>{
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
exports.guid=()=>{
    return (e()+e()+e()+e()+e()+e()+e()+e());
}