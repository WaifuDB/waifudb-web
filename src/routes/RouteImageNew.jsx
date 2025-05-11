import axios from "axios";
import { ShowNotification } from "../helpers/Misc";
import { getAPIUrl } from "../helpers/API";
import { useAuth } from "../providers/AuthProvider";
import ImageEditor from "../components/ImageEditor";

function RouteImageNew() {
    const { user, token } = useAuth();

    const onSubmit = async (data) => {
        try{
            const url = `${getAPIUrl()}/images/new`;
            const body = {
                image_url: data.image_url,
                characters: data.characters,
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

            ShowNotification("Image added successfully", "success");
        }catch(err){
            console.error(err);
            ShowNotification(err.message, "error");
        }
    }

    return (
        <>
            <h1>Add Image</h1>
            <ImageEditor onSubmit={onSubmit} />
            {/* <WaifuEditor prefill={data} onSubmit={onSubmit} /> */}
        </>
    )
}

export default RouteImageNew;