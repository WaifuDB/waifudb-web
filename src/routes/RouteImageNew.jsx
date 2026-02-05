import axios from "axios";
import { ShowNotification } from "../helpers/Misc";
import { getAPIUrl } from "../helpers/API";
import { useAuth } from "../providers/AuthProvider";
import ImageEditor from "../components/ImageEditor";

function RouteImageNew() {
    const { user, token } = useAuth();
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('character_id');

    const onSubmit = async (data) => {
        try{
            const url = `${getAPIUrl()}/images/new`;

            const formData = new FormData();
            formData.append("image", data.image, `charadb_${Date.now()}`);
            formData.append("characters", JSON.stringify(data.characters));
            formData.append("user_id", user.id);
            formData.append("token", token);

            const response = await axios.post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
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
            <ImageEditor onSubmit={onSubmit} prefill={[characterId]} />
            {/* <WaifuEditor prefill={data} onSubmit={onSubmit} /> */}
        </>
    )
}

export default RouteImageNew;