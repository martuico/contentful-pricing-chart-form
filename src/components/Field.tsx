import React, { useEffect, useState } from 'react';
import {
    SectionHeading,
    Button,
    EditorToolbarButton,
    Modal,
    ModalHeader,
    ModalContent,
    Form,
    FieldGroup,
    Select,
    Option,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TextField,
    Pill
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { v4 as uuid } from 'uuid';

interface FieldProps {
    sdk: FieldExtensionSDK;
}

/** An Item which represents an list item of the repeater app */
interface Item {
    id: string;
    name: string;
    packages: Array<Package>;
}

interface Pack {
    sys: {
        id: string;
    }
}

interface Package {
    name: string;
    value: string;
}

/** A simple utility function to create a 'blank' item
 * @returns A blank `Item` with a uuid
*/
function createItem(): Item {
    return {
        id: uuid(),
        name: '',
        packages: [],
    };
}

function FormOptions({ options, setOptions }: any) {
    const [name, setName] = useState("");
    const submitForm = (e: React.KeyboardEvent) => {
        e.preventDefault()
        setTimeout(() => {
            console.log('add pill')
        },1000)
    };
    return (
        <React.Fragment>
        <Form onSubmit={ submitForm }  spacing="default">
          <FieldGroup>
            <TextField
              required
              name="nameInput"
              id="nameInput"
              labelText="Name"
              helpText="Provide name your options"
              value={name}
              onChange={(e) => setName(e.target.value)}
              textLinkProps={{
                icon: 'PlusCircleTrimmed',
                text: 'Clict to add',
                onClick: (e: any) => {
                    setOptions([...options, name])
                    setName('')
                },
              }}
            />
          </FieldGroup>
        </Form>
      </React.Fragment>
    );
}

/** The Field component is the Repeater App which shows up
 * in the Contentful field.
 *
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = (props: FieldProps) => {
    // const { valueName = 'Value' } = props.sdk.parameters.instance as any;
    const [items, setItems] = useState<Item[]>([]);
    const [packagesIds, setPackagesIds] = useState<string[]>([]);
    const [packages, setPack] = useState<any[]>([]);
    const [options, setOptions] = useState<string[]>(["Checked"]);
    const [isShown, setShown] = useState(false);

    useEffect(() => {
        // This ensures our app has enough space to render
        props.sdk.window.startAutoResizer();

        // Every time we change the value on the field, we update internal state
        props.sdk.field.onValueChanged((value: Item[]) => {
            if (Array.isArray(value)) {
                setItems(value);
            }
        });

        let currentPack :Pack[] = []
        let propPackage = props.sdk.entry.fields.packages

        propPackage.onValueChanged((value) => {
            console.log('column', value)
            if(Array.isArray(value)) {
                currentPack = value
            }
        })
        let transFormedPackeges : any = []
        setPackagesIds(Object.assign([], currentPack.map((s) => s.sys.id)))
        packagesIds.forEach(async (id: any, index: number) => {
            await props.sdk.space.getEntry(id)
                .then((res) => {
                    transFormedPackeges.push(res)
                })
            if(packagesIds.length - 1  === index) {
                setPack(transFormedPackeges)
            }
        })

    }, [items, props.sdk.field, props.sdk.entry.fields.packages]);


    /** Adds another item to the list */
    const addNewItem = () => {
        props.sdk.field.setValue([...items, createItem()]);
    };
    // console.log(props.sdk.entry.fields.title.getValue())
    /** Creates an `onChange` handler for an item based on its `property`
     * @returns A function which takes an `onChange` event
    */
    const createOnChangeHandler = (item: Item, property: 'name' | 'packages') => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const itemList = items.concat();
        const index = itemList.findIndex((i) => i.id === item.id);

        itemList.splice(index, 1, { ...item, [property]: e.target.value, packages: packages.map(pack => {
            const obj = pack.fields.internalName
                return {name: obj[Object.keys(obj)[0]], value: ''}
        }) });

        props.sdk.field.setValue(itemList);
    };

    /** Deletes an item from the list */
    const deleteItem = (item: Item) => {
        props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
    };
    console.log('packages', items)
    console.log('items', items)

    const updateOnChange = (id: string, tierInd: number) => (e: React.ChangeEvent<HTMLSelectElement> ) => {
        const itemList = items.concat();
        const index = itemList.findIndex((i) => i.id === id);
        const updateItem = Object.assign({}, itemList[index])
        itemList.splice(index, 1, { ...updateItem,
            packages: packages.map((pack, packInd) => {
                const obj = pack.fields.internalName
                    return {name: obj[Object.keys(obj)[0]], value: (packInd === tierInd ) ? e.target.value: ''}
            })
        })
        props.sdk.field.setValue(itemList);
        console.log(e.target.value, index, id)
    }

    const deleteOption = (ind: number) => {
        const optionList = options.concat();
        optionList.splice(ind, 1)
        setOptions(optionList)
    }

    return (
        <>
        <div>
            <div style={{ marginBottom: tokens.spacingL }}>
                <SectionHeading>Options</SectionHeading>
                <FormOptions options={options} setOptions={setOptions}/>
                {options.map((option, optionInd) => {
                    return (option.toLocaleLowerCase() !== 'checked' ?
                        <Pill
                            tabIndex={optionInd}
                            label={option}
                            onClose={() => {
                                deleteOption(optionInd)
                            }}
                            style={{ margin: tokens.spacingS }}
                        /> : <Pill
                            tabIndex={optionInd}
                            label={option}
                            style={{ margin: tokens.spacingS }}
                        />)
                })}
            </div>

            <Table>
                <TableHead>
                    <TableRow>
                    <TableCell>Name</TableCell>
                    {
                        packages.map((item) => {
                            const obj = item.fields.internalName
                            return (<TableCell>{obj[Object.keys(obj)[0]]}</TableCell>)
                        })
                    }
                    <TableCell>
                    </TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <TextField
                                    id={item.id}
                                    name="name"
                                    labelText=""
                                    value={item.name}
                                    onChange={createOnChangeHandler(item, 'name')}
                                />
                            </TableCell>
                            {
                                packages.map((tier, tierInd) => {
                                    return (
                                        <TableCell>
                                            <Select
                                                name={`select-${tierInd}`}
                                                id={`select-${tierInd}`}
                                                value={""}
                                                onChange={updateOnChange(item.id,tierInd)}>
                                                <Option value=""
                                                    selected>
                                                    Please select an option...
                                                </Option>
                                                { options &&
                                                    options.map(option => (<Option value={option}>
                                                        {option}
                                                    </Option>))
                                                }
                                            </Select>
                                        </TableCell>
                                    )
                                })
                            }
                            <TableCell align="right">
                                <EditorToolbarButton
                                    label="delete"
                                    icon="Delete"
                                    onClick={() => deleteItem(item)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button
                buttonType="naked"
                onClick={addNewItem}
                icon="PlusCircle"
                style={{ marginTop: tokens.spacingS }}
            >
                Add Item
            </Button>

        </div>
        <React.Fragment>
            <Modal onClose={() => setShown(false)} isShown={isShown}>
                    {() => (
                    <>
                        <ModalHeader
                            title="Create Tier"
                            onClose={() => setShown(false)}
                        />
                        <ModalContent>

                        </ModalContent>
                    </>
                )}
            </Modal>
        </React.Fragment>
        </>
    );
};

export default Field;
