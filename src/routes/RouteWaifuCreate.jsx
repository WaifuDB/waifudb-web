import axios from "axios";
import WaifuEditor from "../components/WaifuEditor";
import { ShowNotification } from "../helpers/Misc";
import { getAPIUrl } from "../helpers/API";
import { useAuth } from "../providers/AuthProvider";

function RouteWaifuCreate() {
    const { user, token } = useAuth();

    const onSubmit = async (data) => {
        try{
            const url = `${getAPIUrl()}/characters/create`;
            const body = {
                name: data.name,
                jp_name: data.jp_name,
                age: data.age,
                gender: data.gender,
                image_url: data.image_url,
                birth_place: data.birthplace,
                birth_date: data.birthdate,
                height: data.height,
                weight: data.weight,
                blood_type: data.blood_type,
                cup_size: data.cup_size,
                bust: data.bust,
                waist: data.waist,
                hip: data.hip,
                description: data.description,
                source: data.source,

                user_id: user.id,
                token: token,
            }

            const response = await axios.post(url, body, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            });

            const dataResponse = response.data;

            if(response.status !== 201){ // 201 Created
                throw new Error(dataResponse.error || "Unknown error occurred.");
            }

            ShowNotification("Character created successfully", "success");
        }catch(err){
            console.error(err);
            ShowNotification(err.message, "error");
        }
    }

    return (
        <>
            <h1>Add Character</h1>
            <WaifuEditor onSubmit={onSubmit} />
        </>
    )
}

export default RouteWaifuCreate;