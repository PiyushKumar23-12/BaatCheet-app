import ValidationError from "../errors/ValidationError.js";
export const validate=(schema)=>{
    return (req,res,next)=>{
        const result=schema.safeParse({
            params: req.params,
            body: req.body,
            query: req.query
        });

        if(!result.success){
            throw new ValidationError(
                "Invalid request",
                result.error.issues
            );
        }
        next();
    }
}