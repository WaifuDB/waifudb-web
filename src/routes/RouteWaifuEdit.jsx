import axios from "axios";
import WaifuEditor from "../components/WaifuEditor";
import { ShowNotification } from "../helpers/Misc";
import { getAPIUrl } from "../helpers/API";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";

function RouteWaifuEdit() {
    const { user, token } = useAuth();
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try{
            const url = `${getAPIUrl()}/characters/edit`;
            const body = {
                id: id.split('-')[0], // Get the ID from the URL (before the dash)
                name: data.name,
                jp_name: data.jp_name,
                age: data.age,
                image_url: data.image_url,
                birth_place: data.birthplace,
                birth_date: data.birthdate,
                height: data.height,
                weight: data.weight,
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

            if(response.status !== 200){ // 200 OK
                throw new Error(dataResponse.error || "Unknown error occurred.");
            }

            ShowNotification("Character updated successfully", "success");

            navigate(`/waifus/${dataResponse.id}`); // Redirect to the updated character page
        }catch(err){
            console.error(err);
            ShowNotification(err.message, "error");
        }
    }

    useEffect(() => {
        if (!id) {
            console.error('ID is required to fetch waifu data');
            return;
        }

        (async () => {
            //split "id" by dash and only take the first part
            const waifuId = id.split('-')[0];
            try {
                const response = await axios.get(`${getAPIUrl()}/characters/get/${waifuId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch waifu data');
                }
                const waifuData = response.data;
                if (!waifuData) {
                    throw new Error('No data found for the given ID');
                }
                setData(waifuData);
            } catch (error) {
                ShowNotification(error.message, "error");
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!data) {
        return <div>No data found</div>;
    }

    return (
        <>
            <h1>Edit Character</h1>
            <WaifuEditor prefill={data} onSubmit={onSubmit} />
        </>
    )
}

export default RouteWaifuEdit;