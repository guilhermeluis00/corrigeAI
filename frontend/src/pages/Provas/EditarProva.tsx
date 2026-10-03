import { useParams } from 'react-router-dom';
import ProvaForm from '../../components/ProvaForm';
export default function EditarProva() { const { id } = useParams(); return <ProvaForm id={id} />; }
