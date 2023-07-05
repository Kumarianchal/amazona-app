import Alert from 'react-bootstrap/Alert';
export default function MessageBox(props){
    return (
        <Alert variant={props.variant || 'info'}>{props.children}</Alert>   //props.children is used to render the content
    );
}